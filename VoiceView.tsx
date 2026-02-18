
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';

// Manual Base64 Implementation as per SDK guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceView: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputAudioCtx;
      outputAudioContextRef.current = outputAudioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          }
        },
        callbacks: {
          onopen: () => {
            setIsListening(true);
            const source = inputAudioCtx.createMediaStreamSource(stream);
            const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) {
                int16[i] = input[i] * 32768;
              }
              const pcmData = encode(new Uint8Array(int16.buffer));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev, `User: ${message.serverContent!.inputTranscription!.text}`]);
            }
            if (message.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev, `Giga: ${message.serverContent!.outputTranscription!.text}`]);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioCtx) {
              const buffer = await decodeAudioData(decode(audioData), outputAudioCtx, 24000, 1);
              const source = outputAudioCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioCtx.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Neural Voice Error", e),
          onclose: () => setIsListening(false),
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      alert("Microphone integration failed. Ensure hardware is active.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsListening(false);
  };

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="w-full max-w-2xl glass rounded-[48px] p-12 text-center relative overflow-hidden shadow-2xl border-white/5">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-gold/5">
          <div className={`h-full bg-accent-gold transition-all duration-1000 ${isListening ? 'w-full shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'w-0'}`}></div>
        </div>

        <div className="mb-12 relative">
          <div className={`w-36 h-36 rounded-full border-4 border-accent-gold/20 mx-auto flex items-center justify-center transition-all duration-700 ${isListening ? 'scale-110 shadow-[0_0_80px_rgba(251,191,36,0.3)]' : ''}`}>
            <div className={`w-28 h-28 rounded-full bg-accent-gold flex items-center justify-center text-black shadow-lg ${isListening ? 'animate-pulse' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-12">
                <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.75 6.75 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
              </svg>
            </div>
          </div>
          {isListening && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-accent-gold/10 rounded-full animate-ping pointer-events-none"></div>
          )}
        </div>

        <h2 className="font-outfit text-4xl font-black mb-4 tracking-tight uppercase">Giga Voice Link</h2>
        <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
          Direct neural-audio uplink. Process voice logic in real-time with sub-millisecond response latency.
        </p>

        <button
          onClick={isListening ? stopSession : startSession}
          className={`px-16 py-5 rounded-[24px] font-black text-[13px] tracking-widest uppercase transition-all duration-500 shadow-2xl active:scale-95 ${
            isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/10' 
            : 'bg-accent-gold hover:bg-yellow-500 text-black shadow-accent-gold/20'
          }`}
        >
          {isListening ? 'Terminate Uplink' : 'Initialize Voice Link'}
        </button>

        <div className="mt-14 text-left h-52 overflow-y-auto space-y-4 px-6 py-4 bg-black/20 rounded-[32px] border border-white/5 custom-scrollbar">
          {transcript.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-10 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
              <p className="text-sm font-black uppercase tracking-widest">Awaiting Neural Signal...</p>
            </div>
          ) : (
            transcript.map((line, i) => (
              <div key={i} className={`p-4 rounded-2xl ${line.startsWith('User:') ? 'bg-white/5 border border-white/5 text-slate-400' : 'bg-accent-gold/5 border border-accent-gold/10 text-accent-gold font-bold'} animate-in slide-in-from-bottom-2`}>
                <p className="text-xs leading-relaxed">{line}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-14 flex gap-10 items-center text-slate-700 uppercase text-[9px] font-black tracking-[0.4em]">
        <span className="flex items-center gap-2">Ultra-Low Latency</span>
        <span className="flex items-center gap-2">HD Vocal Processing</span>
        <span className="flex items-center gap-2">Neural Transcription</span>
      </div>
    </div>
  );
};

export default VoiceView;
