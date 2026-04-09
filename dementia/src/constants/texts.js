const TEXTS = {
  en: {
    title: "Aarogya Tracker",
    caregiver: "Caregiver",
    patient: "Patient",
    condition: "Condition",
    safe: "Environment Stable",
    unsafe: "Environment Unsafe — Check Now",
    map: "Patient Location",
    notifications: "Recent Alerts",
    noAlerts: "No alerts yet",
    mild: "Mild Dementia",
    zoneIn: "Within Safe Zone",
    zoneOut: "Outside Safe Zone",
    comfort: "Comfort Index",
    feedback: "Adaptive Threshold Feedback",
    reacted: "Patient Reacted",
    notReacted: "No Reaction",
    feedbackNote: "Auto recalculates thresholds after every 10 feedbacks",
    saving: "Saving feedback...",
    saved: "Feedback saved",
    thresholdsUpdated: "Thresholds updated based on caregiver feedback.",
    labels: {
      temperature: "Temperature",
      noise: "Noise Level",
      light: "Light Intensity",
      humidity: "Humidity",
      units: {
        celsius: "°C",
         db: "dB",
        lux: "lux",
        percent: "%",
      },
    },
  },

  hi: {
    title: "आरोग्य ट्रैकर",
    caregiver: "देखभालकर्ता",
    patient: "रोगी",
    condition: "स्थिति",
    safe: "वातावरण स्थिर है",
    unsafe: "वातावरण असुरक्षित है — तुरंत जाँच करें",
    map: "रोगी का स्थान",
    notifications: "हाल के अलर्ट",
    noAlerts: "कोई अलर्ट नहीं",
    mild: "हल्का डिमेंशिया",
    zoneIn: "सुरक्षित क्षेत्र में",
    zoneOut: "सुरक्षित क्षेत्र से बाहर",
    comfort: "आराम सूचकांक",
    feedback: "अनुकूली सीमा प्रतिक्रिया",
    reacted: "रोगी ने प्रतिक्रिया दी",
    notReacted: "कोई प्रतिक्रिया नहीं",
    feedbackNote: "हर 10 प्रतिक्रियाओं के बाद सीमा स्वतः समायोजित होती है",
    saving: "फ़ीडबैक सेव हो रहा है...",
    saved: "फ़ीडबैक सेव हुआ",
    thresholdsUpdated:
      "देखभालकर्ता की प्रतिक्रिया के आधार पर सीमा अपडेट की गई।",
    labels: {
      temperature: "तापमान",
      noise: "शोर स्तर",
      light: "प्रकाश तीव्रता",
      humidity: "आर्द्रता",
      units: {
        celsius: "°C",
        db: "dB",
        lux: "lux",
        percent: "%",
      },
    },
  },      

  mr: {
    title: "आरोग्य ट्रॅकर",
    caregiver: "पालक",
    patient: "रुग्ण",
    condition: "स्थिती",
    safe: "वातावरण स्थिर आहे",
    unsafe: "वातावरण असुरक्षित आहे — कृपया तपासा",
    map: "रुग्णाचे स्थान",
    notifications: "अलीकडील सूचना",
    noAlerts: "सूचना नाहीत",
    mild: "हलके डिमेन्शिया",
    zoneIn: "सुरक्षित क्षेत्रात",
    zoneOut: "सुरक्षित क्षेत्राबाहेर",
    comfort: "आराम निर्देशांक",
    feedback: "थ्रेशहोल्ड अभिप्राय",
    reacted: "रुग्णाने प्रतिक्रिया दिली",
    notReacted: "प्रतिक्रिया नाही",
    feedbackNote:
      "प्रत्येक 10 प्रतिसादांनंतर मर्यादा स्वयंचलितपणे सुधारल्या जातात",
    saving: "अभिप्राय जतन होत आहे...",
    saved: "अभिप्राय जतन झाला",
    thresholdsUpdated: "पालकाच्या अभिप्रायावर आधारित मर्यादा अद्ययावत केल्या.",
    labels: {
      temperature: "तापमान",
      noise: "आवाज पातळी",
      light: "प्रकाश तीव्रता",
      humidity: "आर्द्रता",
      units: {
        celsius: "°C",
        db: "dB",
        lux: "lux",
        percent: "%",
      },
    },
  },
};

const ALERT_TEXTS = {
  en: {
    noise_danger:
      "Noise levels are dangerously high. Take the patient to a quieter room and calm them down to avoid anxiety.",
    light_low:
      "Light levels are too low. Turn on lights or move the patient to a brighter area to prevent confusion or falls.",
    temp_very_high:
      "Room temperature is very high. Turn on the fan or AC, give the patient water, and keep them in a cool area.",
    temp_high:
      "Temperature is above comfort. Improve ventilation or move the patient to a cooler spot.",
    noise_high:
      "Noise level is high. Reduce TV or nearby sounds; speak calmly to avoid distress.",
    humidity_high:
      "Humidity is too high. Switch on ventilation or dehumidifier to maintain comfort.",
    stable:
      "Environment is stable and safe. Continue monitoring the patient’s comfort.",
  },

  hi: {
    noise_danger:
      "शोर का स्तर बहुत अधिक है। रोगी को शांत जगह पर ले जाएँ और उन्हें शांत रखें ताकि घबराहट न हो।",
    light_low:
      "प्रकाश बहुत कम है। लाइट चालू करें या रोगी को उजली जगह पर ले जाएँ ताकि भ्रम या गिरने का खतरा न हो।",
    temp_very_high:
      "कमरे का तापमान बहुत अधिक है। पंखा या एसी चालू करें, रोगी को पानी पिलाएँ और ठंडी जगह पर रखें।",
    temp_high:
      "तापमान अधिक है। वेंटिलेशन सुधारें या रोगी को ठंडी जगह पर ले जाएँ।",
    noise_high:
      "शोर अधिक है। टीवी या आसपास की आवाज़ें कम करें, और रोगी से शांत स्वरों में बात करें।",
    humidity_high:
      "आर्द्रता अधिक है। पंखा या वेंटिलेशन चालू करें ताकि वातावरण आरामदायक रहे।",
    stable: "वातावरण स्थिर और सुरक्षित है। रोगी की निगरानी जारी रखें।",
  },

  mr: {
    noise_danger:
      "आवाज धोकादायक पातळीवर आहे. रुग्णाला शांत खोलीत न्या आणि त्यांना शांत ठेवा.",
    light_low:
      "प्रकाश खूप कमी आहे. दिवे लावा किंवा रुग्णाला उजेडात ठेवा, गोंधळ किंवा पडणे टाळा.",
    temp_very_high:
      "तापमान खूप जास्त आहे. पंखा किंवा एसी चालू करा, रुग्णाला पाणी द्या आणि थंड ठिकाणी ठेवा.",
    temp_high:
      "तापमान जास्त आहे. हवेशीर ठिकाणी न्या किंवा खोलीतील वायुवीजन सुधारवा.",
    noise_high:
      "आवाज जास्त आहे. टीव्ही किंवा इतर आवाज कमी करा, शांतपणे बोला.",
    humidity_high:
      "आर्द्रता जास्त आहे. पंखा किंवा वायुवीजन सुरू करा जेणेकरून आरामदायी वातावरण राहील.",
    stable: "वातावरण स्थिर आणि सुरक्षित आहे. रुग्णावर लक्ष ठेवा.",
  },
};

export { TEXTS, ALERT_TEXTS };
