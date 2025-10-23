import { Lang } from "./types";

export const consentTexts: Record<Lang, { broken: string; hipaa: string; financial: string }> = {
  es: {
    broken: `POLÍTICA DE CITAS INCUMPLIDAS

Cuando se hace una cita dental en nuestra oficina, se reserva un tiempo específico para que el paciente vea al dentista o higienista. La cita permite al dentista satisfacer las necesidades del paciente y programar a otros pacientes igualmente importantes. Las citas rotas resultan en una pérdida de tiempo valioso que podría dedicarse a los pacientes que necesitan tratamiento, y son muy costosos para nuestra oficina.

Por esta razón, si un paciente no asiste a una visita al consultorio, se le cobrará una tarifa de $ 50.00 por una cita rota.

Además, debido a que no estamos en condiciones de determinar si una excusa es válida o no, no se harán excepciones a esta política. Es responsabilidad final del paciente asistir a su cita programada.

Si es necesario cancelar o reprogramar una cita por cualquier motivo, notifique a nuestra oficina al menos 24 horas antes de la hora designada y no se cobrará ninguna tarifa de cita interrumpida. Gracias por su esperada cooperación.`,
    hipaa: `AVISO DE RECONOCIMIENTO DE PRÁCTICAS DE PRIVACIDAD

Entiendo que, en virtud de la Ley de Portabilidad y Responsabilidad del Seguro Médico de 1996 (HIPAA, por sus siglas en inglés), tengo ciertos derechos a la privacidad con respecto a mi información médica protegida. Entiendo que esta información puede y será utilizada para:

1. Realizar, planificar y dirigir mi tratamiento y seguimiento entre los múltiples proveedores de atención médica que pueden estar involucrados en ese tratamiento directa e indirectamente.

2. Obtener el pago de terceros pagadores.

3. Llevar a cabo operaciones normales de atención médica, como evaluaciones de calidad y certificaciones médicas.

He recibido, leído y entiendo su Aviso de Prácticas de Privacidad que contiene una descripción más completa de los usos y divulgaciones de mi información de salud. Entiendo que esta organización tiene el derecho de cambiar sus prácticas de Aviso de Privacidad de vez en cuando y que puedo comunicarme con esta organización en cualquier momento a la dirección anterior para obtener una copia actualizada del Aviso de Prácticas Privadas.

Entiendo que puedo solicitar por escrito que restrinja la forma en que se usa o divulga mi información privada para llevar a cabo tratamientos, pagos u operaciones de atención médica. También entiendo que no está obligado a aceptar las restricciones solicitadas, pero si está de acuerdo, está obligado a cumplir con dichas restricciones.`,
    financial: `AUTORIZACIÓN FINANCIERA

He revisado la información en este cuestionario y es precisa según mi conocimiento. Entiendo que esta información será utilizada por el dentista para ayudar a determinar un tratamiento dental apropiado y saludable. Si hay algún cambio en mi estatus médico, se lo informaré al dentista.

Autorizo a la compañía de seguros indicada en este formulario a pagar al dentista todos los beneficios asegurados por los servicios prestados que de otra manera fueran pagaderos a mi. Autorizo el uso de esta firma en todas las peticiones al seguro. Autorizo al dentista a revelar toda información necesaria para asegurar el pago de los beneficios.

Entiendo que soy económicamente responsable por todos los cargos ya sean o no pagados por el seguro.

El pago debe hacerse en su totalidad a la hora del tratamiento al menos que se hayan aprobado arreglos con anterioridad.`
  },
  en: {
    broken: `BROKEN APPOINTMENT POLICY

When a dental appointment is made in our office, a specific time is reserved for the patient to see the dentist or hygienist. The appointment allows the dentist to meet the patient's needs and schedule other equally important patients. Broken appointments result in a loss of valuable time that could be spent with patients in need of treatment, and they are very costly to our office.

For this reason, if a patient fails to keep an office visit, he or she will be charged a fee of $50.00 for a broken appointment.

In addition, because we are not in the position to determine if an excuse is valid or not, no exceptions will be made to this policy. It is the patient's ultimate responsibility to keep their scheduled appointment.

If an appointment does need to be canceled or rescheduled for any reason, please notify our office at least 24 hours in advance of the appointed time, and no broken appointment fee will be charged. Thank you for your anticipated cooperation.`,
    hipaa: `NOTICE OF PRIVACY PRACTICES ACKNOWLEDGEMENT

I understand that, under the Health Insurance Portability & Accountability Act of 1996 ("HIPAA"), I have certain rights to privacy regarding my protected health information. I understand that this information can and will be used to:

1. Conduct, plan, and direct my treatment and follow-up among the multiple healthcare providers who may be involved in that treatment directly and indirectly.

2. Obtain payment from third-party payers.

3. Conduct normal healthcare operations such as quality assessments and physician certifications.

I have received, read, and understand your Notice of Privacy Practices. I understand that this organization has the right to change its Notice of Privacy Practices from time to time and that I can contact this organization to obtain a current copy of the Notice of Privacy Practices.

I understand that I may request in writing that you restrict how my private information is used or disclosed to carry out treatment, payment, or health care operations. I also understand that you are not required to agree to my requested restrictions, but if you do agree, then you are bound to abide by such restrictions.`,
    financial: `FINANCIAL AUTHORIZATION

I have reviewed the information in this questionnaire and it is accurate to my knowledge. I understand that this information will be used by the dentist to help determine appropriate and healthy dental treatment. If there is any change in my medical status, I will inform the dentist.

I authorize the insurance company indicated on this form to pay the dentist all insured benefits for services rendered that would otherwise be payable to me. I authorize the use of this signature in all insurance requests. I authorize the dentist to disclose all necessary information to ensure payment of benefits.

I understand that I am financially responsible for all charges, whether or not paid by insurance.

Payment is due in full at time of treatment, unless prior arrangements have been approved.`
  }
};
