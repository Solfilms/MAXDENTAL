"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Languages, Undo2 } from "lucide-react";
import ConsentBlock from "./ConsentBlock";
import SignatureCanvas from "./SignatureCanvas";
import AddressAutocomplete from "./AddressAutocomplete";
import { MEDICAL_QUESTIONS } from "./MedicalQuestions";
import { IntakePayload, Lang } from "./types";
import { postIntake } from "@/lib/postIntake";
import { generatePDFs, downloadPDFs, sendPDFsByEmail } from "@/lib/generatePDFs";

export default function MaxDentalForm(){
  const [lang, setLang] = useState<Lang>("es");
  const [patientType, setPatientType] = useState<'new' | 'existing' | null>(null);
  const [adminMode, setAdminMode] = useState(false);

  const t = useMemo(()=>({
    brand: "Max Dental",
    headline: lang==='es'? "Formulario de Bienvenida" : "Welcome Form",
    sub: lang==='es'? "Completa tus datos en 60 segundos. Fácil desde celular o tablet." : "Finish in 60 seconds. Mobile & tablet friendly.",
    step: lang==='es'? ["Información Personal","Historial Médico","Preferencias","Consentimientos","Firma"] : ["Personal Info","Medical History","Preferences","Consents","Signature"],
    next: lang==='es'? "Continuar":"Continue", back: lang==='es'? "Atrás":"Back",
    submit: lang==='es'? "Enviar":"Submit", uploading: lang==='es'? "Enviando...":"Sending...",
    successTitle: lang==='es'? "¡Listo!":"All set!", successBody: lang==='es'? "Tu información fue enviada y los documentos firmados fueron enviados a tu email. Te contactaremos para confirmar tu cita." : "Your info was sent and signed documents were emailed to you. We'll reach out to confirm your appointment.",
    
    // Nuevas traducciones para selección de paciente
    patientTypeTitle: lang==='es'? "¿Eres un paciente nuevo o existente?" : "Are you a new or existing patient?",
    patientTypeSub: lang==='es'? "Selecciona tu tipo de paciente para continuar" : "Select your patient type to continue",
    newPatient: lang==='es'? "Paciente Nuevo" : "New Patient",
    newPatientDesc: lang==='es'? "Primera vez visitando Max Dental" : "First time visiting Max Dental",
    existingPatient: lang==='es'? "Paciente Existente" : "Existing Patient", 
    existingPatientDesc: lang==='es'? "Ya tienes historial en nuestra clínica" : "Already have records at our clinic",
    
    // Traducciones para pacientes existentes
    existingPatientVerification: lang==='es'? "Verificación de Paciente Existente" : "Existing Patient Verification",
    enterVerificationData: lang==='es'? "Ingresa los siguientes datos para verificar tu identidad" : "Enter the following data to verify your identity",
    lastName: lang==='es'? "Apellido" : "Last Name",
    phoneNumber: lang==='es'? "Número de Teléfono" : "Phone Number",
    birthdate: lang==='es'? "Fecha de Nacimiento" : "Date of Birth",
    verifyPatient: lang==='es'? "Verificar Paciente" : "Verify Patient",
    patientFound: lang==='es'? "¡Paciente Encontrado!" : "Patient Found!",
    welcomeBack: lang==='es'? "¡Bienvenido de vuelta!" : "Welcome back!",
    lastVisit: lang==='es'? "Última visita" : "Last visit",
    medicalChanges: lang==='es'? "¿Hay cambios en tu historial médico?" : "Are there changes in your medical history?",
    noChanges: lang==='es'? "No hay cambios" : "No changes",
    yesChanges: lang==='es'? "Sí, hay cambios" : "Yes, there are changes",
    visitPurpose: lang==='es'? "¿Cuál es el propósito de tu visita?" : "What is the purpose of your visit?",
    continueTreatment: lang==='es'? "Continuar tratamiento" : "Continue treatment",
    generalCheckup: lang==='es'? "Chequeo general" : "General checkup",
    otherPurpose: lang==='es'? "Otro" : "Other",
    specifyOther: lang==='es'? "Especificar otro propósito" : "Specify other purpose",
  }),[lang]);

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  
  // Estados para pacientes existentes
  const [existingPatientStep, setExistingPatientStep] = useState(0); // 0: verificación, 1: encontrado, 2: cambios médicos, 3: propósito visita, 4: firma
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [foundPatient, setFoundPatient] = useState<any>(null);
  const [verificationData, setVerificationData] = useState({
    lastName: "",
    phone: "",
    birthdate: ""
  });
  const [medicalHistoryChanged, setMedicalHistoryChanged] = useState<boolean | null>(null);
  const [visitPurpose, setVisitPurpose] = useState("");
  const [otherPurpose, setOtherPurpose] = useState("");

  // Función para cargar datos del localStorage
  const loadFormData = (): IntakePayload => {
    if (typeof window === 'undefined') return getDefaultFormData();
    
    try {
      const saved = localStorage.getItem('maxdental-form-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verificar que no sea muy viejo (más de 24 horas)
        if (parsed.timestamp && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000) {
          // Asegurar que patientType no sea null si hay datos guardados
          const loadedData = { ...parsed, meta: undefined };
          if (loadedData.patientType === null && (loadedData.firstName || loadedData.lastName || loadedData.email)) {
            // Si hay datos pero patientType es null, asumir que es paciente nuevo
            loadedData.patientType = 'new';
          }
          return loadedData;
        }
      }
    } catch (error) {
      console.warn('Error loading form data from localStorage:', error);
    }
    
    return getDefaultFormData();
  };

  // Función para obtener datos por defecto
  const getDefaultFormData = (): IntakePayload => ({
    lang,
    // Tipo de paciente
    patientType: null,
    // Información personal
    lastName: "", firstName: "", middleInitial: "", socialSecurityNumber: "",
    address: "", city: "", state: "", zipCode: "",
    cellPhone: "", homePhone: "", email: "",
    sex: "M", age: "", birthdate: "",
    maritalStatus: lang==='es' ? "Soltero/a" : "Single", occupation: "", employer: "",
    workAddress: "", workPhone: "", workEmail: "",
    referralSource: "",
    emergencyContact: "", emergencyPhone: "", emergencyWorkPhone: "", emergencyEmail: "",
    // Seguro
    insurance: "", insuranceId: "", insuranceGroup: "", subscriber: "", insuranceOther: "",
    // Preferencias
    marketing: lang==='es' ? "Google" : "Google", referredBy: "", marketingOther: "",
    contactPref: lang==='es' ? "WhatsApp" : "WhatsApp", visitType: lang==='es' ? "Evaluación general" : "General Exam", 
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
    signatureDataUrl: "",
    meta: undefined
  });

  const [data, setData] = useState<IntakePayload>(loadFormData());

  function update<K extends keyof IntakePayload>(k: K, v: IntakePayload[K]){ 
    setData(d=> {
      const newData = {...d, [k]: v};
      // Guardar automáticamente en localStorage solo si no es admin mode
      if (!adminMode) {
        saveFormData(newData);
      }
      return newData;
    }); 
  }

  // Función para guardar datos en localStorage
  const saveFormData = (formData: IntakePayload) => {
    if (typeof window === 'undefined') return;
    
    try {
      const dataToSave = {
        ...formData,
        timestamp: Date.now()
      };
      localStorage.setItem('maxdental-form-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Error saving form data to localStorage:', error);
    }
  };

  // Función para limpiar datos guardados
  const clearFormData = () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('maxdental-form-data');
    } catch (error) {
      console.warn('Error clearing form data from localStorage:', error);
    }
  };

  // Función para verificar paciente existente
  const verifyExistingPatient = async () => {
    if (verificationAttempts >= 3) {
      setError(lang === 'es' ? 'Máximo de intentos alcanzado. Por favor, complete el formulario completo.' : 'Maximum attempts reached. Please complete the full form.');
      return;
    }

    setBusy(true);
    setError("");

    try {
      // Verificar si Supabase está configurado
      const { isSupabaseConfigured } = await import('@/lib/supabase-queries');
      
      if (!isSupabaseConfigured()) {
        // Usar datos mock si Supabase no está configurado
        const mockPatients = [
          {
            id: "1",
            first_name: "Juan",
            last_name: "Pérez",
            phone: "305-123-4567",
            birthdate: "1990-05-15",
            last_visit: "2024-01-15",
            medical_history: {
              "Diabetes": "No",
              "Hipertensión": "No",
              "Alergias": "No"
            }
          },
          {
            id: "2",
            first_name: "María",
            last_name: "García",
            phone: "305-987-6543",
            birthdate: "1985-03-22",
            last_visit: "2024-02-10",
            medical_history: {
              "Diabetes": "Sí",
              "Hipertensión": "No",
              "Alergias": "Sí"
            }
          }
        ];

        const found = mockPatients.find(patient => 
          patient.last_name.toLowerCase() === verificationData.lastName.toLowerCase() &&
          patient.phone === verificationData.phone &&
          patient.birthdate === verificationData.birthdate
        );
        
        if (found) {
          setFoundPatient({
            id: found.id,
            firstName: found.first_name,
            lastName: found.last_name,
            phone: found.phone,
            birthdate: found.birthdate,
            lastVisit: found.last_visit,
            medicalHistory: found.medical_history
          });
          setExistingPatientStep(1);
          setVerificationAttempts(0);
        } else {
          setVerificationAttempts(prev => prev + 1);
          setError(lang === 'es' 
            ? `Paciente no encontrado. Intentos restantes: ${2 - verificationAttempts}` 
            : `Patient not found. Attempts remaining: ${2 - verificationAttempts}`
          );
        }
        return;
      }

      // Usar Supabase si está configurado
      const { findExistingPatient } = await import('@/lib/supabase-queries');
      
      const found = await findExistingPatient(
        verificationData.lastName,
        verificationData.phone,
        verificationData.birthdate
      );

      if (found) {
        // Transformar datos para compatibilidad
        const transformedPatient = {
          id: found.id,
          firstName: found.first_name,
          lastName: found.last_name,
          phone: found.phone,
          birthdate: found.birthdate,
          lastVisit: found.last_visit,
          medicalHistory: found.medical_history
        };
        
        setFoundPatient(transformedPatient);
        setExistingPatientStep(1);
        setVerificationAttempts(0);
      } else {
        setVerificationAttempts(prev => prev + 1);
        setError(lang === 'es' 
          ? `Paciente no encontrado. Intentos restantes: ${2 - verificationAttempts}` 
          : `Patient not found. Attempts remaining: ${2 - verificationAttempts}`
        );
      }
    } catch (error) {
      console.error('Error verifying patient:', error);
      setError(lang === 'es' ? 'Error al verificar paciente' : 'Error verifying patient');
    } finally {
      setBusy(false);
    }
  };

  // Función para resetear verificación de paciente existente
  const resetExistingPatientVerification = () => {
    setExistingPatientStep(0);
    setVerificationAttempts(0);
    setFoundPatient(null);
    setVerificationData({ lastName: "", phone: "", birthdate: "" });
    setError("");
  };
  
  const calculateAge = (birthdate: string) => {
    if (birthdate && birthdate.includes('-')) {
      const birthDate = new Date(birthdate);
      const today = new Date();
      const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      update("age", age.toString());
    }
  };
  
  function updateMedicalHistory(question: string, value: "Yes" | "No") {
    update("medicalHistory", { ...data.medicalHistory, [question]: value });
  }

  // Función para determinar si los campos de trabajo deben estar bloqueados
  function shouldBlockWorkFields() {
    const workBlockingOccupations = [
      'N/A',
      lang === 'es' ? 'Desempleado' : 'Unemployed',
      lang === 'es' ? 'Estudiante' : 'Student', 
      lang === 'es' ? 'Jubilado' : 'Retired',
      lang === 'es' ? 'Ama de casa' : 'Homemaker'
    ];
    return workBlockingOccupations.includes(data.occupation);
  }

  // Función para obtener campos faltantes y hacer scroll con animación
  function scrollToMissingFields() {
    const missingFields: string[] = [];
    
    switch (step) {
      case 0: // Información personal
        if (!data.lastName) missingFields.push('lastName');
        if (!data.firstName) missingFields.push('firstName');
        if (!data.address) missingFields.push('address');
        if (!data.city) missingFields.push('city');
        if (!data.state) missingFields.push('state');
        if (!data.zipCode) missingFields.push('zipCode');
        if (!data.cellPhone) missingFields.push('cellPhone');
        if (!data.email) missingFields.push('email');
        if (!data.birthdate) missingFields.push('birthdate');
        if (!data.maritalStatus) missingFields.push('maritalStatus');
        if (!data.occupation || data.occupation === "") missingFields.push('occupation');
        
        const shouldBlock = shouldBlockWorkFields();
        if (!shouldBlock && (!data.employer || data.employer === "")) missingFields.push('employer');
        
        const hasEmergencyFields = (data.emergencyContact && data.emergencyContact !== "") || data.emergencyContact === "N/A";
        if (!hasEmergencyFields) missingFields.push('emergencyContact');
        const hasEmergencyPhoneFields = (data.emergencyPhone && data.emergencyPhone !== "") || data.emergencyPhone === "N/A";
        if (!hasEmergencyPhoneFields) missingFields.push('emergencyPhone');
        break;
        
      case 1: // Historial médico
        MEDICAL_QUESTIONS[lang].forEach(question => {
          if (!data.medicalHistory[question]) {
            missingFields.push(`medical-${question}`);
          }
        });
        break;
        
      case 2: // Preferencias
        if (!data.marketing) missingFields.push('marketing');
        if (!data.contactPref) missingFields.push('contactPref');
        if (!data.visitType) missingFields.push('visitType');
        break;
        
      case 3: // Consentimientos
        if (!data.consentsAccepted.broken) missingFields.push('broken-consent');
        if (!data.consentsAccepted.hipaa) missingFields.push('hipaa-consent');
        if (!data.consentsAccepted.financial) missingFields.push('financial-consent');
        break;
        
      case 4: // Firma
        if (!data.signatureDataUrl) missingFields.push('signature');
        break;
    }
    
    // Hacer scroll al primer campo faltante con animación
    if (missingFields.length > 0) {
      const firstMissingField = missingFields[0];
      const element = document.getElementById(firstMissingField) || document.querySelector(`[data-field="${firstMissingField}"]`);
      
      if (element) {
        // Scroll suave al elemento
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Agregar animación de destello
        element.classList.add('animate-pulse', 'ring-4', 'ring-red-300', 'ring-opacity-50');
        
        // Remover la animación después de 3 segundos
        setTimeout(() => {
          element.classList.remove('animate-pulse', 'ring-4', 'ring-red-300', 'ring-opacity-50');
        }, 3000);
        
        // Enfocar el elemento si es un input
        if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
          (element as HTMLElement).focus();
        }
      }
    }
  }

  // Validación de pasos
  function canProceedToNextStep() {
    // En modo admin, siempre permitir avanzar
    if (adminMode) return true;
    
    switch (step) {
      case 0: // Información personal
        // Verificar campos obligatorios (incluyendo N/A como válido)
        const hasRequiredFields = data.lastName && data.firstName && data.address && data.city && 
                                 data.state && data.zipCode && data.cellPhone && data.email && 
                                 data.birthdate && data.maritalStatus;
        
        // Verificar campos de trabajo según la ocupación seleccionada
        const shouldBlock = shouldBlockWorkFields();
        const hasWorkFields = data.occupation && data.occupation !== "";
        const hasEmployerFields = shouldBlock || (data.employer && data.employer !== "");
        
        // Verificar campos de emergencia (deben estar llenos o marcados como N/A)
        const hasEmergencyFields = (data.emergencyContact && data.emergencyContact !== "") || data.emergencyContact === "N/A";
        const hasEmergencyPhoneFields = (data.emergencyPhone && data.emergencyPhone !== "") || data.emergencyPhone === "N/A";
        
        return hasRequiredFields && hasWorkFields && hasEmployerFields && hasEmergencyFields && hasEmergencyPhoneFields;
        
      case 1: // Historial médico
        return Object.keys(data.medicalHistory).length === MEDICAL_QUESTIONS[lang].length &&
               MEDICAL_QUESTIONS[lang].every(q => data.medicalHistory[q]);
      case 2: // Preferencias
        return data.marketing && data.contactPref && data.visitType;
      case 3: // Consentimientos
        return data.consentsAccepted.broken && data.consentsAccepted.hipaa && data.consentsAccepted.financial;
      case 4: // Firma
        return data.signatureDataUrl;
      default:
        return true;
    }
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
          source:"web_welcome_v5", 
          submittedAt: new Date().toISOString(), 
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone, 
          ua: navigator.userAgent 
        }
      };
      
      // Enviar datos al webhook
      await postIntake(payload);
      
      // Generar PDFs
      const pdfs = await generatePDFs(payload);
      
      // Enviar PDFs por email
      await sendPDFsByEmail(payload, pdfs);
      
      // También descargar PDFs localmente
      downloadPDFs(pdfs);
      
      // Limpiar datos guardados después del envío exitoso
      clearFormData();
      
      setOk(true);
    }catch(err:any){ 
      setError(err?.message||"Error"); 
    } finally{ 
      setBusy(false); 
    }
  }

  const label = "block text-emerald-900 mb-2 text-sm font-medium";
  const input = "w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-emerald-900 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200";
  const btn = "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95";

  return (
    <div className="min-h-screen w-full bg-white text-emerald-950">
      <div className="max-w-5xl mx-auto px-3 py-4 sm:px-4 sm:py-8 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-emerald-200 bg-white flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-emerald-900">Max Dental - Digital Forms</h1>
              <p className="text-sm sm:text-base text-emerald-700">{lang==='es' ? 'Mejor práctica dental en North Miami Beach • Implantes • Invisalign' : 'Best dental practice in North Miami Beach • Implants • Invisalign'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={()=> setLang(lang==='es'?'en':'es')} 
              className="inline-flex items-center gap-1 px-3 py-2 sm:px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base" 
              aria-label="Toggle language"
            >
              <Languages className="h-3 w-3 sm:h-4 sm:w-4"/>
              {lang==='es' ? 'EN' : 'ES'}
            </button>
            <button 
              onClick={()=> setAdminMode(!adminMode)} 
              className={`inline-flex items-center gap-1 px-3 py-2 sm:px-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base ${
                adminMode 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
              }`}
              aria-label="Toggle admin mode"
            >
              🔧 {adminMode ? 'Admin ON' : 'Admin OFF'}
            </button>
          </div>
        </div>

        {/* Patient Type Selection */}
        {patientType === null && !adminMode && (
          <div className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-emerald-900 mb-4">{t.patientTypeTitle}</h2>
              <p className="text-lg text-emerald-700 mb-8">{t.patientTypeSub}</p>
              
              {/* Botón para limpiar datos guardados */}
              {data.firstName || data.lastName || data.email ? (
                <div className="mb-6">
                  <button
                    onClick={() => {
                      clearFormData();
                      setData(getDefaultFormData());
                      setStep(0);
                      setExistingPatientStep(0);
                      setVerificationAttempts(0);
                      setFoundPatient(null);
                      setVerificationData({ lastName: "", phone: "", birthdate: "" });
                      setMedicalHistoryChanged(null);
                      setVisitPurpose("");
                      setOtherPurpose("");
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    {lang==='es' ? '🔄 Limpiar datos guardados y empezar de nuevo' : '🔄 Clear saved data and start fresh'}
                  </button>
                </div>
              ) : null}
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* New Patient */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPatientType('new');
                    update('patientType', 'new');
                  }}
                  className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl hover:border-emerald-400 transition-all duration-200 shadow-lg hover:shadow-xl group"
                >
                  <div className="text-4xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">🆕</div>
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-2">{t.newPatient}</h3>
                  <p className="text-sm sm:text-base text-emerald-700">{t.newPatientDesc}</p>
                </motion.button>

                {/* Existing Patient */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setPatientType('existing');
                    update('patientType', 'existing');
                  }}
                  className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl hover:border-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl group"
                >
                  <div className="text-4xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">👤</div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">{t.existingPatient}</h3>
                  <p className="text-sm sm:text-base text-blue-700">{t.existingPatientDesc}</p>
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Patient Flow */}
        {patientType === 'existing' && (
          <div className="max-w-2xl mx-auto">
            {/* Step 0: Verification */}
            {existingPatientStep === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-emerald-900 mb-4">{t.existingPatientVerification}</h2>
                <p className="text-emerald-700 mb-6">{t.enterVerificationData}</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.lastName} *</label>
                    <input
                      type="text"
                      value={verificationData.lastName}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder={t.lastName}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.phoneNumber} *</label>
                    <input
                      type="tel"
                      value={verificationData.phone}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="305-123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.birthdate} *</label>
                    <input
                      type="date"
                      value={verificationData.birthdate}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, birthdate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      setPatientType(null);
                      resetExistingPatientVerification();
                    }}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={verifyExistingPatient}
                    disabled={!verificationData.lastName || !verificationData.phone || !verificationData.birthdate || busy}
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {busy ? (lang === 'es' ? 'Verificando...' : 'Verifying...') : t.verifyPatient}
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Patient Found */}
            {existingPatientStep === 1 && foundPatient && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-emerald-900 mb-2">{t.patientFound}</h2>
                  <h3 className="text-xl text-emerald-800 mb-2">{t.welcomeBack} {foundPatient.firstName} {foundPatient.lastName}!</h3>
                  <p className="text-gray-600">{t.lastVisit}: {new Date(foundPatient.lastVisit).toLocaleDateString()}</p>
                </div>

                <button
                  onClick={() => setExistingPatientStep(2)}
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  {lang === 'es' ? 'Continuar' : 'Continue'}
                </button>
              </div>
            )}

            {/* Step 2: Medical History Changes */}
            {existingPatientStep === 2 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-emerald-900 mb-4">{t.medicalChanges}</h2>
                
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setMedicalHistoryChanged(false);
                      setExistingPatientStep(3);
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      medicalHistoryChanged === false 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                        : 'border-gray-300 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <span className="font-medium">{t.noChanges}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setMedicalHistoryChanged(true);
                      // Si hay cambios, ir al formulario completo
                      setPatientType('new');
                      setStep(1); // Ir directamente al historial médico
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      medicalHistoryChanged === true 
                        ? 'border-blue-500 bg-blue-50 text-blue-800' 
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <span className="font-medium">{t.yesChanges}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Visit Purpose */}
            {existingPatientStep === 3 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-emerald-900 mb-4">{t.visitPurpose}</h2>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setVisitPurpose('continue')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      visitPurpose === 'continue' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                        : 'border-gray-300 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔄</span>
                      <span className="font-medium">{t.continueTreatment}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setVisitPurpose('checkup')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      visitPurpose === 'checkup' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                        : 'border-gray-300 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🩺</span>
                      <span className="font-medium">{t.generalCheckup}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setVisitPurpose('other')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      visitPurpose === 'other' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                        : 'border-gray-300 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📋</span>
                      <span className="font-medium">{t.otherPurpose}</span>
                    </div>
                  </button>
                </div>

                {visitPurpose === 'other' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.specifyOther}</label>
                    <input
                      type="text"
                      value={otherPurpose}
                      onChange={(e) => setOtherPurpose(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder={t.specifyOther}
                    />
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setExistingPatientStep(2)}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={() => setExistingPatientStep(4)}
                    disabled={!visitPurpose || (visitPurpose === 'other' && !otherPurpose)}
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Signature */}
            {existingPatientStep === 4 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-emerald-900 mb-4">
                  {lang === 'es' ? 'Firma Digital' : 'Digital Signature'}
                </h2>
                
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    {lang === 'es' 
                      ? 'Importante: Al firmar, confirmas que no hay cambios en tu historial médico y autorizas el tratamiento según el propósito indicado.'
                      : 'Important: By signing, you confirm there are no changes in your medical history and authorize treatment according to the indicated purpose.'
                    }
                  </p>
                </div>

                <SignatureCanvas
                  onChange={(url) => update("signatureDataUrl", url)}
                />

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setExistingPatientStep(3)}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={async () => {
                      if (!data.signatureDataUrl) return;
                      
                      setBusy(true);
                      try {
                        // Crear payload simplificado para paciente existente
                        const existingPayload: IntakePayload = {
                          ...data,
                          patientType: 'existing',
                          firstName: foundPatient.firstName,
                          lastName: foundPatient.lastName,
                          visitType: visitPurpose === 'other' ? otherPurpose : (visitPurpose === 'continue' ? t.continueTreatment : t.generalCheckup),
                          medicalHistory: foundPatient.medicalHistory,
                          // Mantener solo los campos necesarios para el PDF
                        };

                        // Generar PDFs
                        const pdfs = await generatePDFs(existingPayload);
                        
                        // Enviar por email
                        await sendPDFsByEmail(existingPayload, pdfs);
                        
                        // Descargar localmente
                        downloadPDFs(pdfs);
                        
                        setOk(true);
                      } catch (err: any) {
                        setError(err?.message || "Error");
                      } finally {
                        setBusy(false);
                      }
                    }}
                    disabled={!data.signatureDataUrl || busy}
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {busy ? t.uploading : t.submit}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Mode Indicator */}
        {adminMode && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800">
                <span className="text-lg">🔧</span>
                <span className="font-semibold">
                  {lang==='es' ? 'MODO ADMIN ACTIVADO' : 'ADMIN MODE ACTIVE'} - 
                  {lang==='es' ? ' Navegación libre sin validaciones' : ' Free navigation without validations'}
                </span>
              </div>
              <button
                onClick={() => {
                  clearFormData();
                  setData(getDefaultFormData());
                  setStep(0);
                  setPatientType(null);
                  setExistingPatientStep(0);
                  setVerificationAttempts(0);
                  setFoundPatient(null);
                  setVerificationData({ lastName: "", phone: "", birthdate: "" });
                  setMedicalHistoryChanged(null);
                  setVisitPurpose("");
                  setOtherPurpose("");
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                {lang==='es' ? 'Limpiar Todo' : 'Clear All'}
              </button>
            </div>
          </div>
        )}

        {/* Progress */}
        {(patientType !== null || adminMode) && (
          <div className="mb-6">
            {/* Versión móvil - Solo números */}
            <div className="block sm:hidden">
              <div className="flex items-center justify-between mb-3">
                {t.step.map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full grid place-items-center text-sm font-bold transition-all duration-200 ${
                      i === step 
                        ? 'bg-emerald-600 text-white scale-110' 
                        : i < step 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {i+1}
                    </div>
                    {i === step && (
                      <span className="text-xs text-emerald-700 mt-1 text-center max-w-[60px] leading-tight">
                        {s}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Versión desktop - Con texto completo */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 text-sm mb-2">
                {t.step.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full grid place-items-center text-sm font-bold ${i <= step ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>{i+1}</div>
                    <span className={`${i === step ? 'text-emerald-700' : 'text-emerald-600'}`}>{s}</span>
                    {i < t.step.length - 1 && <ChevronRight className="h-4 w-4 text-emerald-600" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${((step+1)/t.step.length)*100}%`}}/>
            </div>
          </div>
        )}

        {/* Form */}
        {(patientType !== null || adminMode) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
            {/* Step 0: Información Personal */}
            {step === 0 && (
              <motion.div key="personal-info" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                {/* Welcome Message */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">👋</div>
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                        {lang === 'es' ? '¡Bienvenido a Max Dental!' : 'Welcome to Max Dental!'}
                      </h3>
                      <p className="text-emerald-800 text-sm leading-relaxed">
                        {lang === 'es' 
                          ? 'Por favor, complete las siguientes preguntas con su información personal. Si alguna pregunta no aplica para usted, puede usar el botón "N/A" para indicarlo. ¡Tome su tiempo y sea lo más preciso posible!'
                          : 'Please complete the following questions with your personal information. If any question doesn\'t apply to you, you can use the "N/A" button to indicate so. Take your time and be as accurate as possible!'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={label}>{lang==='es' ? "Apellido" : "Last Name"} *</label>
                      <input id="lastName" type="text" required value={data.lastName} onChange={e=> update("lastName", e.target.value)} className={input} placeholder={lang==='es' ? "Apellido" : "Last Name"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Primer Nombre" : "First Name"} *</label>
                    <input id="firstName" type="text" required value={data.firstName} onChange={e=> update("firstName", e.target.value)} className={input} placeholder={lang==='es' ? "Primer Nombre" : "First Name"} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{lang==='es' ? "Inicial 2do Nombre" : "Middle Initial"}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={data.middleInitial} 
                        onChange={e=> update("middleInitial", e.target.value.toUpperCase())} 
                        className={input} 
                        placeholder={lang==='es' ? "Inicial" : "Initial"} 
                      />
                      <button 
                        type="button"
                        onClick={() => update("middleInitial", data.middleInitial === "N/A" ? "" : "N/A")}
                        className={`text-xs px-1 py-0.5 rounded-sm ${
                          data.middleInitial === "N/A" 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>
                  <div>
                      <label className={label}>{lang==='es' ? "No. Seguro Social" : "Social Security Number"}</label>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <input 
                          type="text" 
                          value={data.socialSecurityNumber} 
                          onChange={e=> {
                            let value = e.target.value.replace(/\D/g, ''); // Solo números
                            if (value.length > 9) value = value.slice(0, 9);
                            if (value.length >= 6) {
                              value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5);
                            } else if (value.length >= 4) {
                              value = value.slice(0, 3) + '-' + value.slice(3);
                            }
                            update("socialSecurityNumber", value);
                          }} 
                          className={`${input} text-sm sm:text-base`}
                          placeholder={lang==='es' ? "XXX-XX-XXXX" : "XXX-XX-XXXX"} 
                          maxLength={11}
                        />
                        <label className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-emerald-700 cursor-pointer hover:text-emerald-800 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={data.socialSecurityNumber === "N/A"} 
                            onChange={e=> e.target.checked ? update("socialSecurityNumber", "N/A") : update("socialSecurityNumber", "")} 
                            className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 bg-white border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2"
                          />
                          <span className="font-medium">{lang==='es' ? "N/A" : "N/A"}</span>
                        </label>
                      </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className={label}>{lang==='es' ? "Mes" : "Month"} *</label>
                    <select 
                      required 
                      value={data.birthdate ? data.birthdate.split('-')[1] : ''} 
                      onChange={e=> {
                        const currentDate = data.birthdate ? data.birthdate.split('-') : ['', '', ''];
                        const newDate = [currentDate[0], e.target.value, currentDate[2]].join('-');
                        update("birthdate", newDate);
                        calculateAge(newDate);
                      }} 
                      className={input}
                    >
                        <option value="">{lang==='es' ? 'Mes' : 'Month'}</option>
                        <option value="01">{lang==='es' ? 'Enero' : 'January'}</option>
                        <option value="02">{lang==='es' ? 'Febrero' : 'February'}</option>
                        <option value="03">{lang==='es' ? 'Marzo' : 'March'}</option>
                        <option value="04">{lang==='es' ? 'Abril' : 'April'}</option>
                        <option value="05">{lang==='es' ? 'Mayo' : 'May'}</option>
                        <option value="06">{lang==='es' ? 'Junio' : 'June'}</option>
                        <option value="07">{lang==='es' ? 'Julio' : 'July'}</option>
                        <option value="08">{lang==='es' ? 'Agosto' : 'August'}</option>
                        <option value="09">{lang==='es' ? 'Septiembre' : 'September'}</option>
                        <option value="10">{lang==='es' ? 'Octubre' : 'October'}</option>
                        <option value="11">{lang==='es' ? 'Noviembre' : 'November'}</option>
                        <option value="12">{lang==='es' ? 'Diciembre' : 'December'}</option>
                    </select>
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Día" : "Day"} *</label>
                    <select 
                      required 
                      value={data.birthdate ? data.birthdate.split('-')[2] : ''} 
                      onChange={e=> {
                        const currentDate = data.birthdate ? data.birthdate.split('-') : ['', '', ''];
                        const newDate = [currentDate[0], currentDate[1], e.target.value].join('-');
                        update("birthdate", newDate);
                        calculateAge(newDate);
                      }} 
                      className={input}
                    >
                      <option value="">{lang==='es' ? 'Día' : 'Day'}</option>
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day.toString().padStart(2, '0')}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Año" : "Year"} *</label>
                    <select 
                      required 
                      value={data.birthdate ? data.birthdate.split('-')[0] : ''} 
                      onChange={e=> {
                        const currentDate = data.birthdate ? data.birthdate.split('-') : ['', '', ''];
                        const newDate = [e.target.value, currentDate[1], currentDate[2]].join('-');
                        update("birthdate", newDate);
                        calculateAge(newDate);
                      }} 
                      className={input}
                    >
                      <option value="">{lang==='es' ? 'Año' : 'Year'}</option>
                      {Array.from({length: 120}, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Edad" : "Age"}</label>
                    <input 
                      type="text" 
                      value={data.age ? `${data.age} ${lang==='es' ? 'años' : 'years'}` : ''} 
                      className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-gray-600 cursor-not-allowed" 
                      readOnly
                      placeholder={lang==='es' ? "Se calcula automáticamente" : "Calculated automatically"}
                    />
                  </div>
                </div>
                <div>
                  <label className={label}>{lang==='es' ? "Domicilio" : "Address"} *</label>
                  <AddressAutocomplete
                    value={data.address}
                    onChange={(addressData) => {
                      update("address", addressData.address);
                      update("city", addressData.city);
                      update("state", addressData.state);
                      update("zipCode", addressData.zipCode);
                    }}
                    placeholder={lang==='es' ? "Escribe tu dirección..." : "Type your address..."}
                    className={input}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
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
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={label}>{lang==='es' ? "Nombre Completo" : "Full Name"} *</label>
                    <input type="text" required value={`${data.firstName} ${data.lastName}`.trim()} className={input} placeholder={lang==='es' ? "Nombre completo" : "Full name"} readOnly />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Celular" : "Cell Phone"} *</label>
                      <input id="cellPhone" type="tel" required value={data.cellPhone} onChange={e=> update("cellPhone", e.target.value)} className={input} placeholder={lang==='es' ? "Celular" : "Cell Phone"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Tel de Casa" : "Home Phone"}</label>
                    <div className="flex items-center gap-1">
                      <input type="tel" value={data.homePhone} onChange={e=> update("homePhone", e.target.value)} className={input} placeholder={lang==='es' ? "Tel de Casa" : "Home Phone"} />
                      <button 
                        type="button"
                        onClick={() => update("homePhone", data.homePhone === "N/A" ? "" : "N/A")}
                        className={`text-xs px-1 py-0.5 rounded-sm ${
                          data.homePhone === "N/A" 
                            ? 'bg-gray-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={label}>{lang==='es' ? "Sexo" : "Sex"} *</label>
                    <select value={data.sex} onChange={e=> update("sex", e.target.value as "M" | "F")} className={input}>
                      <option value="M">{lang==='es' ? "M (Masculino)" : "M (Male)"}</option>
                      <option value="F">{lang==='es' ? "F (Femenino)" : "F (Female)"}</option>
                    </select>
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Estado Civil" : "Marital Status"} *</label>
                    <select value={data.maritalStatus} onChange={e=> update("maritalStatus", e.target.value)} className={input}>
                      <option value={lang==='es' ? "Soltero/a" : "Single"}>{lang==='es' ? "Soltero/a" : "Single"}</option>
                      <option value={lang==='es' ? "Casado/a" : "Married"}>{lang==='es' ? "Casado/a" : "Married"}</option>
                      <option value={lang==='es' ? "Divorciado/a" : "Divorced"}>{lang==='es' ? "Divorciado/a" : "Divorced"}</option>
                      <option value={lang==='es' ? "Viudo/a" : "Widowed"}>{lang==='es' ? "Viudo/a" : "Widowed"}</option>
                      <option value={lang==='es' ? "Otro" : "Other"}>{lang==='es' ? "Otro" : "Other"}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={label}>{lang==='es' ? "Ocupación" : "Occupation"} *</label>
                    <select 
                      required 
                      value={data.occupation} 
                      onChange={e=> update("occupation", e.target.value)} 
                      className={input}
                    >
                      <option value="" disabled>{lang==='es' ? 'Seleccione su ocupación' : 'Select your occupation'}</option>
                      <option value={lang==='es' ? 'Empleado' : 'Employee'}>{lang==='es' ? 'Empleado' : 'Employee'}</option>
                      <option value={lang==='es' ? 'Trabajador independiente' : 'Self-employed'}>{lang==='es' ? 'Trabajador independiente' : 'Self-employed'}</option>
                      <option value={lang==='es' ? 'Desempleado' : 'Unemployed'}>{lang==='es' ? 'Desempleado' : 'Unemployed'}</option>
                      <option value={lang==='es' ? 'Estudiante' : 'Student'}>{lang==='es' ? 'Estudiante' : 'Student'}</option>
                      <option value={lang==='es' ? 'Jubilado' : 'Retired'}>{lang==='es' ? 'Jubilado' : 'Retired'}</option>
                      <option value={lang==='es' ? 'Ama de casa' : 'Homemaker'}>{lang==='es' ? 'Ama de casa' : 'Homemaker'}</option>
                      <option value={lang==='es' ? 'Medio tiempo' : 'Part-time'}>{lang==='es' ? 'Medio tiempo' : 'Part-time'}</option>
                      <option value={lang==='es' ? 'Tiempo completo' : 'Full-time'}>{lang==='es' ? 'Tiempo completo' : 'Full-time'}</option>
                      <option value={lang==='es' ? 'Militar / Veterano' : 'Military / Veteran'}>{lang==='es' ? 'Militar / Veterano' : 'Military / Veteran'}</option>
                      <option value={lang==='es' ? 'Otro' : 'Other'}>{lang==='es' ? 'Otro' : 'Other'}</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Paciente trabaja para" : "Patient works for"} *</label>
                    <input 
                      type="text" 
                      required 
                      value={shouldBlockWorkFields() ? "" : data.employer} 
                      onChange={e=> update("employer", e.target.value)} 
                      className={`${input} ${shouldBlockWorkFields() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder={shouldBlockWorkFields() ? (lang==='es' ? 'No aplica para esta ocupación' : 'Not applicable for this occupation') : (lang==='es' ? 'Empresa o empleador' : 'Company or employer')} 
                      disabled={shouldBlockWorkFields()}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={label}>{lang==='es' ? "Domicilio del Trabajo" : "Work Address"}</label>
                    <input 
                      type="text" 
                      value={shouldBlockWorkFields() ? "" : data.workAddress} 
                      onChange={e=> update("workAddress", e.target.value)} 
                      className={`${input} ${shouldBlockWorkFields() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder={shouldBlockWorkFields() ? (lang==='es' ? 'No aplica para esta ocupación' : 'Not applicable for this occupation') : (lang==='es' ? "Domicilio del Trabajo" : "Work Address")} 
                      disabled={shouldBlockWorkFields()}
                    />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Tel del Trabajo" : "Work Phone"}</label>
                    <input 
                      type="tel" 
                      value={shouldBlockWorkFields() ? "" : data.workPhone} 
                      onChange={e=> update("workPhone", e.target.value)} 
                      className={`${input} ${shouldBlockWorkFields() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder={shouldBlockWorkFields() ? (lang==='es' ? 'No aplica para esta ocupación' : 'Not applicable for this occupation') : (lang==='es' ? "Tel del Trabajo" : "Work Phone")} 
                      disabled={shouldBlockWorkFields()}
                    />
                  </div>
                </div>
                <div>
                  <label className={label}>{lang==='es' ? "Email del Trabajo" : "Work Email"}</label>
                  <input 
                    type="email" 
                    value={shouldBlockWorkFields() ? "" : data.workEmail} 
                    onChange={e=> update("workEmail", e.target.value)} 
                    className={`${input} ${shouldBlockWorkFields() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                    placeholder={shouldBlockWorkFields() ? (lang==='es' ? 'No aplica para esta ocupación' : 'Not applicable for this occupation') : (lang==='es' ? "Email del Trabajo" : "Work Email")} 
                    disabled={shouldBlockWorkFields()}
                  />
                </div>
                <div className="border-t border-emerald-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-emerald-900">{lang==='es' ? "Notifique en caso de emergencia" : "Notify in case of emergency"}</h3>
                    <button 
                      type="button"
                      onClick={() => {
                        const isNA = data.emergencyContact === "N/A";
                        update("emergencyContact", isNA ? "" : "N/A");
                        update("emergencyPhone", isNA ? "" : "N/A");
                        update("emergencyWorkPhone", isNA ? "" : "N/A");
                        update("emergencyEmail", isNA ? "" : "N/A");
                      }}
                      className={`text-xs px-1 py-0.5 rounded-sm ${
                        data.emergencyContact === "N/A" 
                          ? 'bg-gray-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={label}>{lang==='es' ? "Nombre Completo" : "Full Name"} *</label>
                      <input 
                        type="text" 
                        required 
                        value={data.emergencyContact === "N/A" ? "" : data.emergencyContact} 
                        onChange={e=> update("emergencyContact", e.target.value)} 
                        className={`${input} ${data.emergencyContact === "N/A" ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        placeholder={lang==='es' ? "Nombre completo" : "Full name"} 
                        disabled={data.emergencyContact === "N/A"}
                      />
                    </div>
                    <div>
                      <label className={label}>{lang==='es' ? "Celular" : "Cell Phone"} *</label>
                      <input 
                        type="tel" 
                        required 
                        value={data.emergencyPhone === "N/A" ? "" : data.emergencyPhone} 
                        onChange={e=> update("emergencyPhone", e.target.value)} 
                        className={`${input} ${data.emergencyPhone === "N/A" ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        placeholder={lang==='es' ? "Celular" : "Cell Phone"} 
                        disabled={data.emergencyPhone === "N/A"}
                      />
                    </div>
                    <div>
                      <label className={label}>{lang==='es' ? "Tel de Casa" : "Home Phone"}</label>
                      <input 
                        type="tel" 
                        value={data.emergencyWorkPhone === "N/A" ? "" : data.emergencyWorkPhone} 
                        onChange={e=> update("emergencyWorkPhone", e.target.value)} 
                        className={`${input} ${data.emergencyWorkPhone === "N/A" ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        placeholder={lang==='es' ? "Tel de Casa" : "Home Phone"} 
                        disabled={data.emergencyWorkPhone === "N/A"}
                      />
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

            {/* Step 1: Historial Médico */}
            {step === 1 && (
              <motion.div key="medical" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{lang==='es' ? "Responda Sí o No a las siguientes preguntas:" : "Answer Yes or No to the following questions:"}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {MEDICAL_QUESTIONS[lang].map((question, i) => (
                      <div key={i} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${
                        data.medicalHistory[question] ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <span className="text-xs sm:text-sm text-emerald-900 flex-1 pr-2">{question}</span>
                        <div className="flex gap-1 ml-2">
                          <select 
                            id={`medical-${question}`}
                            value={data.medicalHistory[question] || ""} 
                            onChange={(e) => updateMedicalHistory(question, e.target.value as "Yes" | "No")}
                            className={`px-1 py-1 sm:px-2 border rounded text-xs bg-white ${
                              data.medicalHistory[question] ? 'border-emerald-300' : 'border-red-300'
                            }`}
                          >
                            <option value="" disabled>{lang==='es' ? 'Sí/No' : 'Yes/No'}</option>
                            <option value="Yes">{lang==='es' ? 'Sí' : 'Yes'}</option>
                            <option value="No">{lang==='es' ? 'No' : 'No'}</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  {Object.keys(data.medicalHistory).filter(q => !data.medicalHistory[q]).length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        {lang==='es' ? 
                          `Faltan ${Object.keys(data.medicalHistory).filter(q => !data.medicalHistory[q]).length} respuestas. Por favor responda todas las preguntas.` :
                          `${Object.keys(data.medicalHistory).filter(q => !data.medicalHistory[q]).length} answers missing. Please answer all questions.`
                        }
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{lang==='es' ? "Información Adicional" : "Additional Information"}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={label}>{lang==='es' ? "¿Está el paciente actualmente tomando algún medicamento?" : "Is the patient currently taking any medications?"}</label>
                      <textarea value={data.medications} onChange={e=> update("medications", e.target.value)} className={input} rows={3} placeholder={lang==='es' ? "Si sí, enlistelos todos" : "If yes, list all"} />
                    </div>
                    <div>
                      <label className={label}>{lang==='es' ? "¿Tiene el paciente alergia a algún medicamento?" : "Does the patient have any medication allergies?"}</label>
                      <textarea value={data.drugAllergies} onChange={e=> update("drugAllergies", e.target.value)} className={input} rows={3} placeholder={lang==='es' ? "Si sí, enlistelos todos" : "If yes, list all"} />
                    </div>
                  </div>
                </div>
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{lang==='es' ? "Preguntas Específicas" : "Specific Questions"}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.bloodTransfusion} onChange={e=> update("bloodTransfusion", e.target.checked)} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{lang==='es' ? "¿Alguna vez ha tenido una transfusión de sangre?" : "Have you ever had a blood transfusion?"}</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.fenPhenRedux} onChange={e=> update("fenPhenRedux", e.target.checked)} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{lang==='es' ? "¿Alguna vez ha tomado Fen-Phen/Redux?" : "Have you ever taken Fen-Phen/Redux?"}</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.bisphosphonates} onChange={e=> update("bisphosphonates", e.target.checked)} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{lang==='es' ? "¿Alguna vez ha usado medicamento bisfosfonato?" : "Have you ever used bisphosphonate medication?"}</span>
                    </label>
                  </div>
                  {data.bloodTransfusion && (
                    <div>
                      <label className={label}>{lang==='es' ? "Si sí, dé las fechas aproximadas" : "If yes, give approximate dates"}</label>
                      <input type="text" value={data.bloodTransfusionDates} onChange={e=> update("bloodTransfusionDates", e.target.value)} className={input} placeholder={lang==='es' ? "Fechas aproximadas" : "Approximate dates"} />
                    </div>
                  )}
                </div>
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{lang==='es' ? "Solo para mujeres" : "Women only"}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.women.pregnant} onChange={e=> update("women", {...data.women, pregnant: e.target.checked})} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{lang==='es' ? "¿Está usted embarazada?" : "Are you pregnant?"}</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.women.nursing} onChange={e=> update("women", {...data.women, nursing: e.target.checked})} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{lang==='es' ? "¿Está usted amamantando?" : "Are you nursing?"}</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <input type="checkbox" checked={data.women.bcp} onChange={e=> update("women", {...data.women, bcp: e.target.checked})} className="text-emerald-600" />
                      <span className="text-sm text-emerald-900">{lang==='es' ? "¿Está usted tomando píldoras anticonceptivas?" : "Are you taking birth control pills?"}</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Preferencias */}
            {step === 2 && (
              <motion.div key="preferences" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">{lang==='es' ? "Información del Seguro" : "Insurance Information"}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={label}>{lang==='es' ? "Seguro dental (compañía)" : "Dental insurance (company)"}</label>
                      <select value={data.insurance} onChange={e=> {
                        const newValue = e.target.value;
                        update("insurance", newValue);
                        if (newValue === "N/A") {
                          // Limpiar campos de seguro cuando selecciona N/A
                          update("insuranceId", "");
                          update("insuranceGroup", "");
                          update("subscriber", "");
                          update("insuranceOther", "");
                        }
                      }} className={input}>
                        <option value="">{lang==='es' ? 'Seleccionar seguro' : 'Select insurance'}</option>
                        <option value="N/A">{lang==='es' ? 'N/A - No tengo seguro' : 'N/A - No insurance'}</option>
                        <option value="Delta Dental">Delta Dental</option>
                        <option value="Florida Blue / BlueDental">Florida Blue / BlueDental</option>
                        <option value="Humana Dental">Humana Dental</option>
                        <option value="Cigna Dental">Cigna Dental</option>
                        <option value="UnitedHealthcare Dental">UnitedHealthcare Dental</option>
                        <option value="MetLife Dental">MetLife Dental</option>
                        <option value="Guardian Dental">Guardian Dental</option>
                        <option value="Ameritas Dental">Ameritas Dental</option>
                        <option value="Sun Life Dental">Sun Life Dental</option>
                        <option value="DentaQuest">DentaQuest</option>
                        <option value="Liberty Dental Plan">Liberty Dental Plan</option>
                        <option value="Aetna Dental">Aetna Dental</option>
                        <option value="EMI Health">EMI Health</option>
                        <option value="Dominion National">Dominion National</option>
                        <option value="SureCare Dental">SureCare Dental</option>
                        <option value="Other">{lang==='es' ? 'Otro no listado' : 'Other not listed'}</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>{lang==='es' ? "ID de seguro" : "Insurance ID"}</label>
                      <input 
                        type="text" 
                        value={data.insurance === "N/A" ? "" : data.insuranceId} 
                        onChange={e=> update("insuranceId", e.target.value)} 
                        className={`${input} ${data.insurance === "N/A" ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        placeholder={lang==='es' ? "ID de seguro" : "Insurance ID"} 
                        disabled={data.insurance === "N/A"}
                      />
                    </div>
                  </div>
                  {data.insurance === "Other" && (
                    <div className="mt-4">
                      <label className={label}>{lang==='es' ? "Especificar compañía de seguro" : "Specify insurance company"}</label>
                      <input type="text" value={data.insuranceOther || ""} onChange={e=> update("insuranceOther", e.target.value)} className={input} placeholder={lang==='es' ? "Nombre de la compañía de seguro" : "Insurance company name"} />
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={label}>{lang==='es' ? "Número de grupo" : "Group #"}</label>
                      <input 
                        type="text" 
                        value={data.insurance === "N/A" ? "" : data.insuranceGroup} 
                        onChange={e=> update("insuranceGroup", e.target.value)} 
                        className={`${input} ${data.insurance === "N/A" ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        placeholder={lang==='es' ? "Número de grupo" : "Group #"} 
                        disabled={data.insurance === "N/A"}
                      />
                    </div>
                    <div>
                      <label className={label}>{lang==='es' ? "Suscriptor (si aplica)" : "Subscriber (if applicable)"}</label>
                      <input 
                        type="text" 
                        value={data.insurance === "N/A" ? "" : data.subscriber} 
                        onChange={e=> update("subscriber", e.target.value)} 
                        className={`${input} ${data.insurance === "N/A" ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        placeholder={lang==='es' ? "Suscriptor" : "Subscriber"} 
                        disabled={data.insurance === "N/A"}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={label}>{lang==='es' ? "¿Cómo conociste Max Dental?" : "How did you hear about us?"} *</label>
                  <select value={data.marketing} onChange={e=> update("marketing", e.target.value)} className={input}>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Google">Google</option>
                    <option value={lang==='es' ? "Referido por un amigo" : "Referred by a friend"}>{lang==='es' ? "Referido por un amigo" : "Referred by a friend"}</option>
                    <option value={lang==='es' ? "Pasé por la oficina / evento" : "Walk-in / Event"}>{lang==='es' ? "Pasé por la oficina / evento" : "Walk-in / Event"}</option>
                    <option value={lang==='es' ? "Otro" : "Other"}>{lang==='es' ? "Otro" : "Other"}</option>
                  </select>
                </div>
                {data.marketing === (lang==='es' ? "Referido por un amigo" : "Referred by a friend") && (
                  <div>
                    <label className={label}>{lang==='es' ? "¿Quién te refirió? (nombre)" : "Who referred you? (name)"}</label>
                    <input type="text" value={data.referredBy} onChange={e=> update("referredBy", e.target.value)} className={input} placeholder={lang==='es' ? "Nombre de quien lo refirió" : "Referrer's name"} />
                  </div>
                )}
                {data.marketing === (lang==='es' ? "Otro" : "Other") && (
                  <div>
                    <label className={label}>{lang==='es' ? "Cuéntanos dónde nos viste" : "Tell us where you saw us"}</label>
                    <input type="text" value={data.marketingOther} onChange={e=> update("marketingOther", e.target.value)} className={input} placeholder={lang==='es' ? "Dónde nos viste" : "Where you saw us"} />
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{lang==='es' ? "¿Cómo prefieres que te contactemos?" : "How should we contact you?"} *</label>
                    <div className="space-y-2">
                      {[
                        { value: "WhatsApp", label: "WhatsApp" },
                        { value: lang==='es' ? "Llamada" : "Call", label: lang==='es' ? "Llamada" : "Call" },
                        { value: "SMS", label: "SMS" },
                        { value: "Email", label: "Email" }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={data.contactPref.includes(option.value)} 
                            onChange={(e) => {
                              const current = data.contactPref.split(',').filter(Boolean);
                              if (e.target.checked) {
                                update("contactPref", [...current, option.value].join(','));
                              } else {
                                update("contactPref", current.filter(item => item !== option.value).join(','));
                              }
                            }} 
                            className="text-emerald-600"
                          />
                          <span className="text-sm text-emerald-900">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Propósito de su visita" : "Purpose of your visit"} *</label>
                    <select value={data.visitType} onChange={e=> update("visitType", e.target.value)} className={input}>
                      <option value={lang==='es' ? "Limpieza / Higiene" : "Cleaning / Hygiene"}>{lang==='es' ? "Limpieza / Higiene" : "Cleaning / Hygiene"}</option>
                      <option value={lang==='es' ? "Evaluación general" : "General Exam"}>{lang==='es' ? "Evaluación general" : "General Exam"}</option>
                      <option value={lang==='es' ? "Consulta de implantes" : "Implant Consult"}>{lang==='es' ? "Consulta de implantes" : "Implant Consult"}</option>
                      <option value={lang==='es' ? "Alineadores (Invisalign)" : "Aligners (Invisalign)"}>{lang==='es' ? "Alineadores (Invisalign)" : "Aligners (Invisalign)"}</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>{lang==='es' ? "Días preferidos" : "Preferred days"}</label>
                    <input type="text" value={data.dayPref} onChange={e=> update("dayPref", e.target.value)} className={input} placeholder={lang==='es' ? "Días preferidos" : "Preferred days"} />
                  </div>
                  <div>
                    <label className={label}>{lang==='es' ? "Horario preferido" : "Preferred time"}</label>
                    <input type="text" value={data.timePref} onChange={e=> update("timePref", e.target.value)} className={input} placeholder={lang==='es' ? "Horario preferido" : "Preferred time"} />
                  </div>
                </div>
                <div>
                  <label className={label}>{lang==='es' ? "Notas (opcional)" : "Notes (optional)"}</label>
                  <textarea value={data.notes} onChange={e=> update("notes", e.target.value)} className={input} rows={3} placeholder={lang==='es' ? "Notas adicionales" : "Additional notes"} />
                </div>
              </motion.div>
            )}

            {/* Step 3: Consentimientos */}
            {step === 3 && (
              <motion.div key="consents" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">{lang==='es' ? "Lea y acepte cada documento" : "Read and accept each document"}</h3>
                  <p className="text-sm text-blue-800 mb-2">
                    {lang==='es' ? 
                      "Por favor, lea atentamente cada uno de los documentos a continuación y marque la casilla de aceptación al final de cada uno." :
                      "Please review each document carefully and check the acceptance box at the end of each one."
                    }
                  </p>
                  <p className="text-sm text-blue-800 mb-2">
                    {lang==='es' ? 
                      "Estos consentimientos son requeridos para continuar con su registro." :
                      "These consents are required to complete your registration."
                    }
                  </p>
                  <p className="text-sm text-blue-800">
                    {lang==='es' ? 
                      "En la siguiente pantalla podrá firmar digitalmente, y una copia de todos los documentos aceptados será enviada a su correo electrónico registrado." :
                      "On the next screen, you will provide your digital signature, and a copy of all accepted documents will be sent to your registered email."
                    }
                  </p>
                </div>
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
                  title={lang==='es' ? "Autorización Financiera" : "Financial Authorization"} 
                  value={data.consentsAccepted.financial} 
                  onChange={v=> update("consentsAccepted", {...data.consentsAccepted, financial: v})} 
                  textKey="financial" 
                />
              </motion.div>
            )}

            {/* Step 4: Firma */}
            {step === 4 && (
              <motion.div key="signature" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">{lang==='es' ? "Importante — Lea antes de continuar" : "Important — Please read before continuing"}</h3>
                  <p className="text-sm text-amber-800 mb-2">
                    {lang==='es' ? 
                      "Al firmar este formulario electrónico, usted certifica que ha leído y entendido toda la información presentada, incluyendo los documentos legales, políticas y consentimientos." :
                      "By signing this electronic form, you certify that you have read and understood all information presented, including all legal documents, policies, and consents."
                    }
                  </p>
                  <p className="text-sm text-amber-800 mb-2">
                    {lang==='es' ? 
                      "Su firma digital tiene la misma validez legal que una firma manuscrita y se aplicará automáticamente en cada documento incluido en este formulario (Política de Citas Incumplidas, Aviso de Privacidad HIPAA y Política Financiera)." :
                      "Your digital signature has the same legal validity as a handwritten signature and will be automatically applied to each document included in this form (Broken Appointment Policy, HIPAA Privacy Notice, and Financial Policy)."
                    }
                  </p>
                  <p className="text-sm text-amber-800">
                    {lang==='es' ? 
                      "Además, autoriza a Max Dental a enviarle una copia electrónica de estos documentos firmados al correo electrónico que usted proporcione." :
                      "You also authorize Max Dental to email you a digital copy of these signed documents to the address you provide."
                    }
                  </p>
                </div>
                <div>
                  <label className={label}>{lang==='es' ? "Firma del paciente" : "Patient signature"} *</label>
                  <SignatureCanvas onChange={v=> update("signatureDataUrl", v)} />
                  <button type="button" onClick={()=> update("signatureDataUrl", "")} className="mt-2 text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                    <Undo2 className="h-4 w-4" />
                    {lang==='es' ? "Borrar firma" : "Clear signature"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            {/* Actions */}
            {!ok && (
              <div className="mt-8 space-y-4">
                {/* Botones principales */}
                <div className="flex flex-row gap-4 items-center justify-between">
                  <button 
                    type="button" 
                    onClick={()=> {
                      if (step === 0) {
                        // Si estamos en el primer paso del formulario, volver a selección de tipo de paciente
                        setPatientType(null);
                        update('patientType', null);
                      } else {
                        // Ir al paso anterior
                        setStep(s=> Math.max(0, s-1));
                      }
                    }} 
                    disabled={busy} 
                    className={`${btn} bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300 hover:from-emerald-200 hover:to-emerald-300 hover:border-emerald-400 flex-1`}
                  >
                    {t.back}
                  </button>
                
                {step < 4 ? (
                  <button 
                    type="button" 
                    onClick={()=> {
                      if (canProceedToNextStep()) {
                        setStep(s=> Math.min(4, s+1));
                      } else {
                        scrollToMissingFields();
                      }
                    }} 
                    disabled={busy} 
                    className={`${btn} flex-1 ${
                      canProceedToNextStep() 
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border border-emerald-800' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border border-red-700'
                    }`}
                  >
                    {canProceedToNextStep() ? (
                      <> {t.next} <ChevronRight className="h-5 w-5"/> </>
                    ) : (
                      <> {lang === 'es' ? 'Ver Campos Faltantes' : 'Show Missing Fields'} <ChevronRight className="h-5 w-5"/> </>
                    )}
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={busy || !canProceedToNextStep()} 
                    className={`${btn} min-w-[140px] ${
                      canProceedToNextStep() 
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border border-emerald-800' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border border-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {busy ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        {t.uploading}
                      </div>
                    ) : (
                      t.submit
                    )}
                  </button>
                )}
              </div>
              
              {/* Indicador de progreso */}
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
                <span>{lang==='es' ? 'Paso' : 'Step'} {step + 1} {lang==='es' ? 'de' : 'of'} {t.step.length}</span>
                <div className="flex gap-1">
                  {t.step.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        i <= step ? 'bg-emerald-600' : 'bg-emerald-200'
                      }`}
                    />
                  ))}
                </div>
                </div>
              </div>
            )}
          </form>
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
                  <p className="text-emerald-700 mt-2 text-sm">
                    {lang==='es' ? 
                      "Los documentos firmados han sido descargados automáticamente a tu dispositivo." :
                      "The signed documents have been automatically downloaded to your device."
                    }
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      {lang==='es' ? "Información sobre el procesamiento de datos:" : "Information about data processing:"}
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• {lang==='es' ? "Sus datos se envían de forma segura a nuestro sistema n8n" : "Your data is securely sent to our n8n system"}</li>
                      <li>• {lang==='es' ? "Se almacenan en Supabase con encriptación" : "Stored in Supabase with encryption"}</li>
                      <li>• {lang==='es' ? "Se envía notificación por email a la oficina" : "Email notification sent to office"}</li>
                      <li>• {lang==='es' ? "Los PDFs se generan con su firma digital" : "PDFs are generated with your digital signature"}</li>
                      <li>• {lang==='es' ? "Pueden ser reformateados para documentos oficiales" : "Can be reformatted for official documents"}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">{error}</div>
        )}
      </div>
    </div>
  );
}
