"use client";

import React, { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Lang } from "./types";
import { consentTexts } from "./ConsentTexts";

export default function ConsentBlock({
  lang, title, value, onChange, textKey
}:{
  lang: Lang;
  title: string;
  value: boolean;
  onChange: (v:boolean)=>void;
  textKey: "broken"|"hipaa"|"financial";
}){
  const [scrolled, setScrolled] = useState(false);
  const boxRef = useRef<HTMLDivElement|null>(null);
  
  useEffect(()=>{
    const el=boxRef.current; 
    if(!el) return;
    const onScroll=()=>{ 
      if(el.scrollTop + el.clientHeight >= el.scrollHeight - 4) setScrolled(true); 
    };
    el.addEventListener('scroll', onScroll); 
    return ()=> el.removeEventListener('scroll', onScroll);
  },[]);
  
  const text = consentTexts[lang][textKey];
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-emerald-900 font-semibold">
        <Info className="h-4 w-4"/>
        {title}
      </div>
      <div 
        ref={boxRef} 
        className="h-48 overflow-y-auto bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900 whitespace-pre-wrap"
      >
        {text}
      </div>
      <label className="flex items-center gap-2 text-emerald-900">
        <input 
          type="checkbox" 
          disabled={!scrolled} 
          checked={value} 
          onChange={e=> onChange(e.target.checked)} 
        />
        <span className="text-sm">
          {lang==='es' ? 'He leído y acepto (debes desplazarte hasta el final)' : 'I have read and accept (scroll to the end first)'}
        </span>
      </label>
    </div>
  );
}
