"use client";

import React, { useEffect, useRef } from "react";

export default function SignatureCanvas({onChange}:{onChange:(dataUrl:string)=>void}){
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const drawing = useRef(false);

  useEffect(()=>{
    const canvas = canvasRef.current; 
    if(!canvas) return;
    const ctx = canvas.getContext('2d'); 
    if(!ctx) return;
    
    const DPR = Math.max(1, window.devicePixelRatio||1);
    const w = canvas.clientWidth*DPR; 
    const h = 160*DPR;
    canvas.width=w; 
    canvas.height=h; 
    ctx.scale(DPR,DPR);
    
    ctx.lineWidth=2; 
    ctx.lineJoin='round'; 
    ctx.lineCap='round'; 
    ctx.strokeStyle='#064E3B';
    
    const pos=(e:any)=>{
      const r=canvas.getBoundingClientRect(); 
      const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left; 
      const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top; 
      return {x,y};
    };
    
    const down=(e:any)=>{
      drawing.current=true; 
      const {x,y}=pos(e); 
      ctx.beginPath(); 
      ctx.moveTo(x,y);
    };
    
    const move=(e:any)=>{
      if(!drawing.current) return; 
      const {x,y}=pos(e); 
      ctx.lineTo(x,y); 
      ctx.stroke();
    };
    
    const up=()=>{
      drawing.current=false; 
      onChange(canvas.toDataURL('image/png'));
    };
    
    canvas.addEventListener('mousedown',down); 
    canvas.addEventListener('mousemove',move); 
    window.addEventListener('mouseup',up);
    canvas.addEventListener('touchstart',down,{passive:true}); 
    canvas.addEventListener('touchmove',move,{passive:true}); 
    window.addEventListener('touchend',up);
    
    return ()=>{
      canvas.removeEventListener('mousedown',down); 
      canvas.removeEventListener('mousemove',move); 
      window.removeEventListener('mouseup',up); 
      canvas.removeEventListener('touchstart',down); 
      canvas.removeEventListener('touchmove',move); 
      window.removeEventListener('touchend',up);
    };
  },[]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-40 rounded-lg bg-emerald-50 touch-none border border-emerald-200"
    />
  );
}
