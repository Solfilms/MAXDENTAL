"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Shield, Languages, Upload, Mail, Calendar, PencilLine, Undo2 } from "lucide-react";
import ConsentBlock from "./ConsentBlock";
import SignatureCanvas from "./SignatureCanvas";
import { MEDICAL_QUESTIONS } from "./MedicalQuestions";
import { IntakePayload, Lang } from "./types";
import { postIntake } from "@/lib/postIntake";

const LOGO_URL = "/assets/maxdental-logo.svg"; // TODO: Add your logo

export default function MaxDentalWelcome(){
  const [lang, setLang] = useState<Lang>("es");

  const t = useMemo(()=>({
    brand: "Max Dental",
    headline: lang==='es'? "Formulario de Bienvenida" : "Welcome Form",
    sub: lang==='es'? "Completa tus datos en 60 segundos. Fácil desde celular o tablet." : "Finish in 60 seconds. Mobile & tablet friendly.",
    step: lang==='es'? ["Contacto","Información Personal","Historial Médico","Preferencias","Consentimientos","Firma"] : ["Contact","Personal Info","Medical History","Preferences","Consents","Signature"],
    next: lang==='es'? "Continuar":"Continue", back: lang==='es'? "Atrás":"Back",
    submit: lang==='es'? "Enviar":"Submit", uploading: lang==='es'? "Enviando...":"Sending...",
    successTitle: lang==='es'? "¡Listo!":"All set!", successBody: lang==='es'? "Tu información fue enviada. Te contactaremos para confirmar tu cita." : "Your info was sent. We'll reach out to confirm your appointment.",
    fields: {
      name: lang==='es'?"Nombre y apellido":"Full name", phone: lang==='es'?"Teléfono":"Phone", email:"Email",
      address: lang==='es'?"Dirección":"Address", city: lang==='es'?"Ciudad":"City", state: lang==='es'?"Estado":"State", zip: lang==='es'?"Código postal":"ZIP code",
      birthdate: lang==='es'?"Fecha de nacimiento":"Birthdate", marital: lang==='es'?"Estado civil":"Marital status",
      maritalOptions: lang==='es'? ["Soltero/a","Casado/a","Divorciado/a","Viudo/a","Otro"] : ["Single","Married","Divorced","Widowed","Other"],
      occupation: lang==='es'?"Ocupación":"Occupation", employer: lang==='es'?"Lugar de trabajo":"Employer",
      emergencyName: lang==='es'?"Contacto de emergencia (nombre)":"Emergency contact (name)",
      emergencyPhone: lang==='es'?"Contacto de emergencia (teléfono)":"Emergency contact (phone)",
      emergencyRelation: lang==='es'?"Relación":"Relation",
      insurance: lang==='es'?"Seguro dental (compañía)":"Dental insurance (company)",
      insuranceId: lang==='es'?"ID de seguro":"Insurance ID",
      insuranceGroup: lang==='es'?"Número de grupo":"Group #",
      subscriber: lang==='es'?"Suscriptor (si aplica)":"Subscriber (if applicable)",
      marketing: lang==='es'?"¿Cómo conociste Max Dental?":"How did you hear about us?",
      marketingOptions: lang==='es'? ["Facebook","Instagram","Google","Referido por un amigo","Pasé por la oficina / evento","Otro"] : ["Facebook","Instagram","Google","Referred by a friend","Walk-in / Event","Other"],
      referredBy: lang==='es'?"¿Quién te refirió? (nombre)":"Who referred you? (name)",
      marketingOther: lang==='es'?"Cuéntanos dónde nos viste":"Tell us where you saw us",
      contactPref: lang==='es'?"¿Cómo prefieres que te contactemos?":"How should we contact you?",
      contactOptions: lang==='es'? ["WhatsApp","Llamada","SMS","Email"] : ["WhatsApp","Call","SMS","Email"],
      visitType: lang==='es'?"¿Qué te gustaría agendar?":"What would you like to book?",
      visitOptions: lang==='es'? ["Limpieza / Higiene","Evaluación general","Consulta de implantes","Alineadores (Invisalign)"] : ["Cleaning / Hygiene","General Exam","Implant Consult","Aligners (Invisalign)"],
      dayPref: lang==='es'?"Días preferidos":"Preferred days", timePref: lang==='es'?"Horario preferido":"Preferred time",
      notes: lang==='es'?"Notas (opcional)":"Notes (optional)",
      upload: lang==='es'?"Sube una foto de tu identificación o seguro (opcional)":"Upload a photo of your ID or insurance (optional)",
      consentsTitle: lang==='es'?"Lee y acepta cada documento":"Read and accept each document",
      signature: lang==='es'?"Firma del paciente":"Patient signature",
      clearSig: lang==='es'?"Borrar firma":"Clear signature",
      medicalTitle: lang==='es'?"Historial médico (marca Sí o No)":"Medical history (check Yes/No)",
      meds: lang==='es'?"¿Toma medicamentos actualmente?":"Are you currently taking any medications?",
      drugAllergy: lang==='es'?"¿Alergia a algún medicamento?":"Any drug allergies?",
      listAll: lang==='es'?"Liste todos":"List all",
      womenOnly: lang==='es'?"Solo para mujeres":"Women only",
      pregnant: lang==='es'?"¿Embarazada?":"Pregnant?",
      nursing: lang==='es'?"¿Amamantando?":"Nursing?",
      bcp: lang==='es'?"¿Píldoras anticonceptivas?":"Birth control pills?"
    }
  }),[lang]);

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState<IntakePayload>({
    lang,
    // Información personal
    lastName: "", firstName: "", middleInitial: "", socialSecurityNumber: "",
    address: "", city: "", state: "", zipCode: "",
    homePhone: "", cellPhone: "", email: "",
    sex: "M", age: "", birthdate: "",
    maritalStatus: t.fields.maritalOptions[0], occupation: "", employer: "",
    workAddress: "", workPhone: "", workEmail: "",
    referralSource: "",
    emergencyContact: "", emergencyPhone: "", emergencyWorkPhone: "", emergencyEmail: "",
    // Seguro
    insurance: "", insuranceId: "", insuranceGroup: "", subscriber: "",
    // Preferencias
    marketing: t.fields.marketingOptions[2], referredBy: "", marketingOther: "",
    contactPref: t.fields.contactOptions[0], visitType: t.fields.visitOptions[1], 
    dayPref: "Lun–Vie", timePref: "Mañana", notes: "",
    // Historial médico
    medicalHistory: {}, medications: "", drugAllergies: "",
    bloodTransfusion: false, bloodTransfusionDates: "",
    fenPhenRedux: false, bisphosphonates: false,
    // Mujeres
    women: { pregnant: false, nursing: false, bcp: false },
    // Consentimientos
    consentsAccepted: { broken: false, hipaa: false, financial: false },
    // Firma
    signatureDataUrl: ""
  });

  function update<K extends keyof IntakePayload>(k: K, v: IntakePayload[K]){ 
    setData(d=> ({...d, [k]: v})); 
  }
  
  function updateMedicalHistory(question: string, value: "Yes" | "No") {
    update("medicalHistory", { ...data.medicalHistory, [question]: value });
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault(); 
    setBusy(true); 
    setError("");
    try{
      const payload: IntakePayload = {
        ...data,
        lang,
        meta: { 
          source:"web_welcome_v4", 
          submittedAt: new Date().toISOString(), 
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone, 
          ua: navigator.userAgent 
        }
      };
      await postIntake(payload);
      setOk(true);
    }catch(err:any){ 
      setError(err?.message||"Error"); 
    } finally{ 
      setBusy(false); 
    }
  }

  const label = "block text-emerald-900 mb-1 text-sm";
  const input = "w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const btn = "inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-medium shadow hover:shadow-lg disabled:opacity-60 text-white";

  const showReferred = data.marketing === t.fields.marketingOptions[3];
  const showOther = data.marketing === t.fields.marketingOptions[5];

  return (
    <div className="min-h-screen w-full bg-white text-emerald-950">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-emerald-200 bg-white flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-emerald-900">Max Dental</h1>
              <p className="text-emerald-700">{lang==='es' ? 'Implantes • Invisalign' : 'Implants • Invisalign'}</p>
            </div>
          </div>
          <button onClick={()=> setLang(lang==='es'?'en':'es')} className={`${btn} bg-emerald-600 hover:bg-emerald-700`} aria-label="Toggle language">
            <Languages className="h-4 w-4"/>
            {lang==='es' ? 'EN' : 'ES'}
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm mb-2">
            {t.step.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`h-6 w-6 rounded-full grid place-items-center text-xs ${i <= step ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>{i+1}</div>
                <span className={`${i === step ? 'text-emerald-700' : 'text-emerald-600'}`}>{s}</span>
                {i < t.step.length - 1 && <ChevronRight className="h-4 w-4 text-emerald-600" />}
              </div>
            ))}
          </div>
          <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 transition-all" style={{ width: `${((step+1)/t.step.length)*100}%`}}/>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 0: Información Personal */}
            {step === 0 && (
              <motion.div key="personal-info" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className={label}>{lang==='es' ? "Apellido" : "Last Name"} *</label>
                    <input type="text" required value={data.lastName} onChange={e=> update("lastName", e.target.value)} className={input} placeholder={lang==='es' ? "Apellido" : "Last Name"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Primer Nombre" : "First Name"} *</label>
                    <input type="text" required value={data.firstName} onChange={e=> update("firstName", e.target.value)} className={input} placeholder={lang==='es' ? "Primer Nombre" : "First Name"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Inicial" : "Middle Initial"}</label>
                    <input type="text" value={data.middleInitial} onChange={e=> update("middleInitial", e.target.value)} className={input} placeholder={lang==='es' ? "Inicial" : "Middle Initial"} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{lang==='es' ? "No. Seguro Social" : "Social Security Number"}</label>
                    <input type="text" value={data.socialSecurityNumber} onChange={e=> update("socialSecurityNumber", e.target.value)} className={input} placeholder={lang==='es' ? "XXX-XX-XXXX" : "XXX-XX-XXXX"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Fecha de Nacimiento" : "Date of Birth"} *</label>
                    <input type="date" required value={data.birthdate} onChange={e=> update("birthdate", e.target.value)} className={input} />
                  </div>
                </div>
                <div>
                  <label className={label}>{lang==='es' ? "Domicilio" : "Address"} *</label>
                  <input type="text" required value={data.address} onChange={e=> update("address", e.target.value)} className={input} placeholder={lang==='es' ? "Domicilio" : "Address"} />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className={label}>{lang==='es' ? "Ciudad" : "City"} *</label>
                    <input type="text" required value={data.city} onChange={e=> update("city", e.target.value)} className={input} placeholder={lang==='es' ? "Ciudad" : "City"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Estado" : "State"} *</label>
                    <input type="text" required value={data.state} onChange={e=> update("state", e.target.value)} className={input} placeholder={lang==='es' ? "Estado" : "State"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Código Postal" : "Zip Code"} *</label>
                    <input type="text" required value={data.zipCode} onChange={e=> update("zipCode", e.target.value)} className={input} placeholder={lang==='es' ? "Código Postal" : "Zip Code"} />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className={label}>{lang==='es' ? "Tel de Casa" : "Home Phone"} *</label>
                    <input type="tel" required value={data.homePhone} onChange={e=> update("homePhone", e.target.value)} className={input} placeholder={lang==='es' ? "Tel de Casa" : "Home Phone"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Cel" : "Cell Phone"}</label>
                    <input type="tel" value={data.cellPhone} onChange={e=> update("cellPhone", e.target.value)} className={input} placeholder={lang==='es' ? "Cel" : "Cell Phone"} />
                  </div>
                  <div>
                    <label className={label}>Email *</label>
                    <input type="email" required value={data.email} onChange={e=> update("email", e.target.value)} className={input} placeholder="Email" />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className={label}>{lang==='es' ? "Sexo" : "Sex"} *</label>
                    <select value={data.sex} onChange={e=> update("sex", e.target.value as "M" | "F")} className={input}>
                      <option value="M">{lang==='es' ? "M (Masculino)" : "M (Male)"}</option>
                      <option value="F">{lang==='es' ? "F (Femenino)" : "F (Female)"}</option>
                    </select>
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Edad" : "Age"}</label>
                    <input type="number" value={data.age} onChange={e=> update("age", e.target.value)} className={input} placeholder={lang==='es' ? "Edad" : "Age"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Estado Civil" : "Marital Status"} *</label>
                    <select value={data.maritalStatus} onChange={e=> update("maritalStatus", e.target.value)} className={input}>
                      {t.fields.maritalOptions.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{lang==='es' ? "Ocupación" : "Occupation"} *</label>
                    <input type="text" required value={data.occupation} onChange={e=> update("occupation", e.target.value)} className={input} placeholder={lang==='es' ? "Ocupación" : "Occupation"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Paciente trabaja para" : "Patient works for"} *</label>
                    <input type="text" required value={data.employer} onChange={e=> update("employer", e.target.value)} className={input} placeholder={lang==='es' ? "Empresa" : "Company"} />
                  </div>
                </div>
                <div>
                  <label className={label}>{lang==='es' ? "Domicilio del Trabajo" : "Work Address"}</label>
                  <input type="text" value={data.workAddress} onChange={e=> update("workAddress", e.target.value)} className={input} placeholder={lang==='es' ? "Domicilio del Trabajo" : "Work Address"} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{lang==='es' ? "Tel del Trabajo" : "Work Phone"}</label>
                    <input type="tel" value={data.workPhone} onChange={e=> update("workPhone", e.target.value)} className={input} placeholder={lang==='es' ? "Tel del Trabajo" : "Work Phone"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Email del Trabajo" : "Work Email"}</label>
                    <input type="email" value={data.workEmail} onChange={e=> update("workEmail", e.target.value)} className={input} placeholder={lang==='es' ? "Email del Trabajo" : "Work Email"} />
                  </div>
                </div>
                <div>
                  <label className={label}>{lang==='es' ? "¿A quién podemos agradecer por su referencia?" : "Whom may we thank for referring you?"}</label>
                  <input type="text" value={data.referralSource} onChange={e=> update("referralSource", e.target.value)} className={input} placeholder={lang==='es' ? "Nombre de quien lo refirió" : "Referrer's name"} />
                </div>
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{lang==='es' ? "Notifique en caso de emergencia" : "Notify in case of emergency"}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={label}>{lang==='es' ? "Contacto de Emergencia" : "Emergency Contact"} *</label>
                      <input type="text" required value={data.emergencyContact} onChange={e=> update("emergencyContact", e.target.value)} className={input} placeholder={lang==='es' ? "Nombre completo" : "Full name"} />
                    </div>
                    <div>
                      <label className={label}>{lang==='es' ? "Tel de Casa" : "Home Phone"} *</label>
                      <input type="tel" required value={data.emergencyPhone} onChange={e=> update("emergencyPhone", e.target.value)} className={input} placeholder={lang==='es' ? "Tel de Casa" : "Home Phone"} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={label}>{lang==='es' ? "Tel del Trabajo" : "Work Phone"}</label>
                      <input type="tel" value={data.emergencyWorkPhone} onChange={e=> update("emergencyWorkPhone", e.target.value)} className={input} placeholder={lang==='es' ? "Tel del Trabajo" : "Work Phone"} />
                    </div>
                    <div>
                      <label className={label}>{lang==='es' ? "Email del Trabajo" : "Work Email"}</label>
                      <input type="email" value={data.emergencyEmail} onChange={e=> update("emergencyEmail", e.target.value)} className={input} placeholder={lang==='es' ? "Email del Trabajo" : "Work Email"} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <motion.div key="personal" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{t.fields.address}</label>
                    <input type="text" value={data.address} onChange={e=> update("address", e.target.value)} className={input} placeholder={t.fields.address} />
                  </div>
                  <div>
                    <label className={label}>{t.fields.city}</label>
                    <input type="text" value={data.city} onChange={e=> update("city", e.target.value)} className={input} placeholder={t.fields.city} />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className={label}>{t.fields.state}</label>
                    <input type="text" value={data.state} onChange={e=> update("state", e.target.value)} className={input} placeholder={t.fields.state} />
                  </div>
                  <div>
                    <label className={label}>{t.fields.zip}</label>
                    <input type="text" value={data.zip} onChange={e=> update("zip", e.target.value)} className={input} placeholder={t.fields.zip} />
                  </div>
                  <div>
                    <label className={label}>{t.fields.birthdate}</label>
                    <input type="date" value={data.birthdate} onChange={e=> update("birthdate", e.target.value)} className={input} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{t.fields.marital}</label>
                    <select value={data.marital} onChange={e=> update("marital", e.target.value)} className={input}>
                      {t.fields.maritalOptions.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>{t.fields.occupation}</label>
                    <input type="text" value={data.occupation} onChange={e=> update("occupation", e.target.value)} className={input} placeholder={t.fields.occupation} />
                  </div>
                </div>
                <div>
                  <label className={label}>{t.fields.employer}</label>
                  <input type="text" value={data.employer} onChange={e=> update("employer", e.target.value)} className={input} placeholder={t.fields.employer} />
                </div>
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{lang==='es' ? "Contacto de Emergencia" : "Emergency Contact"}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className={label}>{t.fields.emergencyName}</label>
                      <input type="text" value={data.emergencyName} onChange={e=> update("emergencyName", e.target.value)} className={input} placeholder={t.fields.emergencyName} />
                    </div>
                    <div>
                      <label className={label}>{t.fields.emergencyPhone}</label>
                      <input type="tel" value={data.emergencyPhone} onChange={e=> update("emergencyPhone", e.target.value)} className={input} placeholder={t.fields.emergencyPhone} />
                    </div>
                    <div>
                      <label className={label}>{t.fields.emergencyRelation}</label>
                      <input type="text" value={data.emergencyRelation} onChange={e=> update("emergencyRelation", e.target.value)} className={input} placeholder={t.fields.emergencyRelation} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Medical History */}
            {step === 2 && (
              <motion.div key="medical" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{t.fields.medicalTitle}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {MEDICAL_QUESTIONS[lang].map((question, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="text-sm text-emerald-900 flex-1">{question}</span>
                        <div className="flex gap-2 ml-4">
                          <label className="flex items-center gap-1 text-sm">
                            <input type="radio" name={`med-${i}`} checked={data.med[question] === true} onChange={()=> toggleMedical(question, true)} className="text-emerald-600" />
                            <span className="text-emerald-700">{lang==='es' ? 'Sí' : 'Yes'}</span>
                          </label>
                          <label className="flex items-center gap-1 text-sm">
                            <input type="radio" name={`med-${i}`} checked={data.med[question] === false} onChange={()=> toggleMedical(question, false)} className="text-emerald-600" />
                            <span className="text-emerald-700">{lang==='es' ? 'No' : 'No'}</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{t.fields.meds}</label>
                    <textarea value={data.medsText} onChange={e=> update("medsText", e.target.value)} className={input} rows={3} placeholder={t.fields.meds} />
                  </div>
                  <div>
                    <label className={label}>{t.fields.drugAllergy}</label>
                    <textarea value={data.drugAllergyText} onChange={e=> update("drugAllergyText", e.target.value)} className={input} rows={3} placeholder={t.fields.drugAllergy} />
                  </div>
                </div>
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{t.fields.womenOnly}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.women.pregnant} onChange={e=> update("women", {...data.women, pregnant: e.target.checked})} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{t.fields.pregnant}</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.women.nursing} onChange={e=> update("women", {...data.women, nursing: e.target.checked})} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{t.fields.nursing}</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.women.bcp} onChange={e=> update("women", {...data.women, bcp: e.target.checked})} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{t.fields.bcp}</span>
                    </label>
                  </div>
                </div>
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{lang==='es' ? "Información Adicional" : "Additional Information"}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.transfusion} onChange={e=> update("transfusion", e.target.checked)} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{lang==='es' ? "¿Transfusiones de sangre?" : "Blood transfusions?"}</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.fenPhen} onChange={e=> update("fenPhen", e.target.checked)} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{lang==='es' ? "¿Fen-Phen o Redux?" : "Fen-Phen or Redux?"}</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.bisphosphonates} onChange={e=> update("bisphosphonates", e.target.checked)} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{lang==='es' ? "¿Bifosfonatos?" : "Bisphosphonates?"}</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <motion.div key="preferences" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{lang==='es' ? "Información del Seguro" : "Insurance Information"}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={label}>{t.fields.insurance}</label>
                      <input type="text" value={data.insurance} onChange={e=> update("insurance", e.target.value)} className={input} placeholder={t.fields.insurance} />
                    </div>
                    <div>
                      <label className={label}>{t.fields.insuranceId}</label>
                      <input type="text" value={data.insuranceId} onChange={e=> update("insuranceId", e.target.value)} className={input} placeholder={t.fields.insuranceId} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={label}>{t.fields.insuranceGroup}</label>
                      <input type="text" value={data.insuranceGroup} onChange={e=> update("insuranceGroup", e.target.value)} className={input} placeholder={t.fields.insuranceGroup} />
                    </div>
                    <div>
                      <label className={label}>{t.fields.subscriber}</label>
                      <input type="text" value={data.subscriber} onChange={e=> update("subscriber", e.target.value)} className={input} placeholder={t.fields.subscriber} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={label}>{t.fields.marketing} *</label>
                  <select value={data.marketing} onChange={e=> update("marketing", e.target.value)} className={input}>
                    {t.fields.marketingOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                {showReferred && (
                  <div>
                    <label className={label}>{t.fields.referredBy}</label>
                    <input type="text" value={data.referredBy} onChange={e=> update("referredBy", e.target.value)} className={input} placeholder={t.fields.referredBy} />
                  </div>
                )}
                {showOther && (
                  <div>
                    <label className={label}>{t.fields.marketingOther}</label>
                    <input type="text" value={data.marketingOther} onChange={e=> update("marketingOther", e.target.value)} className={input} placeholder={t.fields.marketingOther} />
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{t.fields.contactPref} *</label>
                    <select value={data.contactPref} onChange={e=> update("contactPref", e.target.value)} className={input}>
                      {t.fields.contactOptions.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>{t.fields.visitType} *</label>
                    <select value={data.visitType} onChange={e=> update("visitType", e.target.value)} className={input}>
                      {t.fields.visitOptions.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{t.fields.dayPref}</label>
                    <input type="text" value={data.dayPref} onChange={e=> update("dayPref", e.target.value)} className={input} placeholder={t.fields.dayPref} />
                  </div>
                  <div>
                    <label className={label}>{t.fields.timePref}</label>
                    <input type="text" value={data.timePref} onChange={e=> update("timePref", e.target.value)} className={input} placeholder={t.fields.timePref} />
                  </div>
                </div>
                <div>
                  <label className={label}>{t.fields.notes}</label>
                  <textarea value={data.notes} onChange={e=> update("notes", e.target.value)} className={input} rows={3} placeholder={t.fields.notes} />
                </div>
              </motion.div>
            )}

            {/* Step 4: Consents */}
            {step === 4 && (
              <motion.div key="consents" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <h3 className="text-lg font-semibold text-emerald-900">{t.fields.consentsTitle}</h3>
                <ConsentBlock 
                  lang={lang} 
                  title={lang==='es' ? "Política de Citas Incumplidas" : "Broken Appointment Policy"} 
                  value={data.consentsAccepted.broken} 
                  onChange={v=> update("consentsAccepted", {...data.consentsAccepted, broken: v})} 
                  textKey="broken" 
                />
                <ConsentBlock 
                  lang={lang} 
                  title={lang==='es' ? "Aviso de Privacidad (HIPAA)" : "HIPAA Privacy Notice"} 
                  value={data.consentsAccepted.hipaa} 
                  onChange={v=> update("consentsAccepted", {...data.consentsAccepted, hipaa: v})} 
                  textKey="hipaa" 
                />
                <ConsentBlock 
                  lang={lang} 
                  title={lang==='es' ? "Política Financiera" : "Financial Policy"} 
                  value={data.consentsAccepted.financial} 
                  onChange={v=> update("consentsAccepted", {...data.consentsAccepted, financial: v})} 
                  textKey="financial" 
                />
              </motion.div>
            )}

            {/* Step 5: Signature */}
            {step === 5 && (
              <motion.div key="signature" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div>
                  <label className={label}>{t.fields.signature} *</label>
                  <SignatureCanvas onChange={v=> update("signatureDataUrl", v)} />
                  <button type="button" onClick={()=> update("signatureDataUrl", "")} className="mt-2 text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                    <Undo2 className="h-4 w-4" />
                    {t.fields.clearSig}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          {!ok && (
            <div className="flex items-center justify-between mt-8">
              <button type="button" onClick={()=> setStep(s=> Math.max(0, s-1))} disabled={step===0 || busy} className={`${btn} bg-emerald-100 text-emerald-800`}>{t.back}</button>
              {step < 5 ? (
                <button type="button" onClick={()=> setStep(s=> Math.min(5, s+1))} disabled={busy} className={`${btn} bg-emerald-600 hover:bg-emerald-700`}>{t.next} <ChevronRight className="h-4 w-4"/></button>
              ) : (
                <button type="submit" disabled={busy || !data.consentsAccepted.broken || !data.consentsAccepted.hipaa || !data.consentsAccepted.financial || !data.signatureDataUrl} className={`${btn} bg-emerald-600 hover:bg-emerald-700`}>{busy ? t.uploading : t.submit}</button>
              )}
            </div>
          )}

          {/* Success */}
          <AnimatePresence>
            {ok && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 grid place-items-center"><Check className="h-5 w-5 text-emerald-700"/></div>
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-900">{t.successTitle}</h3>
                    <p className="text-emerald-800 mt-1">{t.successBody}</p>
                    <div className="flex flex-wrap gap-2 mt-3 text-sm text-emerald-800">
                      <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4"/> Notificación enviada a la oficina</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4"/> Te contactaremos para confirmar hora</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}
