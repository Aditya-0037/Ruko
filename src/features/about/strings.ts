import type { FeatureStrings } from '../../i18n/types'

export const strings: FeatureStrings = {
  en: {
    'about.title': 'How Ruko was designed',
    'about.lead':
      'Ruko is a calm pause button for the most frightening call of someone’s life, and a quiet way to bring in a second person.',
    'about.lead.easy': 'Ruko helps you pause a scary call and get help from family.',

    'about.tour.heading': 'See it in 60 seconds',
    'about.tour.button': 'Start the 60-second tour',
    'about.tour.hint':
      'Loads the demo family (Kamla and Rahul), turns on yellow design notes and takes you to the home screen.',
    'about.tour.replaceWarning': 'This replaces the setup on this phone with the demo family. You can undo it.',
    'about.tour.toast': 'Tour started. Yellow design notes now appear on every screen. Look for the lightbulb.',
    'about.notes.label': 'Show design notes on every screen',
    'about.notes.desc': 'Short yellow notes explain the thinking behind each screen.',

    'about.problem.heading': 'The problem',
    'about.problem.crore': '{amount} crore',
    'about.problem.lostLabel': 'lost to “digital arrest” scams in India in 2024',
    'about.problem.complaintsValue': '1.23 lakh',
    'about.problem.complaintsLabel': 'digital-arrest complaints in 2024',
    'about.problem.cyberLabel': 'lost to all cyber fraud in India in 2024',
    'about.problem.how':
      'Scammers pose as officers on a video call, keep the person on camera, forbid them from telling anyone and push them to move money to a “safe account”.',
    'about.problem.how.easy': 'Fake officers keep people on a video call. They say: tell no one, and send money.',
    'about.problem.fact':
      'There is no “digital arrest” in Indian law. CBI, police, ED, RBI or customs never arrest anyone or ask for money on a video call. Real agencies send written notices.',
    'about.problem.source': 'Figures: Indian Cybercrime Coordination Centre (I4C), Ministry of Home Affairs.',

    'about.insight.heading': 'The key insight',
    'about.insight.body':
      'Victims are frightened, isolated and told to stay silent. Most scam checkers say “paste a message and get a verdict”, which does not help someone held on a live video call. So Ruko is designed for the frightened moment, and for a second person.',
    'about.insight.body.easy':
      'People on these calls are scared and alone. Ruko is made for that moment, and for a family member who can help.',

    'about.personas.heading': 'Who we designed for',
    'about.persona.kamla.name': 'Kamla Devi, 68',
    'about.persona.kamla.facts': 'Pune · reads Hindi first · uses UPI for small payments · lives alone',
    'about.persona.kamla.need':
      'Needs a calm, big, one-thumb way to pause and get help, without hanging up on someone who sounds like the police.',
    'about.persona.rahul.name': 'Rahul, 34',
    'about.persona.rahul.facts': 'Her son · works in Bengaluru · long, busy days',
    'about.persona.rahul.need':
      'Needs one clear alert when it matters, and one-tap ways to call, approve or block. Not surveillance.',

    'about.principles.heading': 'Four design principles',
    'about.principle.calm.title': 'Calm over clever',
    'about.principle.calm.body':
      'Plain words, one big action per screen, no alarms. Fear makes people freeze; calm helps them think.',
    'about.principle.friction.title': 'Friction you choose',
    'about.principle.friction.body':
      'Kamla sets her own rules while calm, like “wait an hour before sending over {amount} to someone new”. Ruko never blocks her on its own.',
    'about.principle.dignity.title': 'Dignity-first family loop',
    'about.principle.dignity.body':
      'Kamla decides what Rahul can see, and can switch it off in one tap. Help, not surveillance.',
    'about.principle.explain.title': 'Rules you can explain',
    'about.principle.explain.body': 'No black-box verdict. Every warning says exactly which answer triggered it.',

    'about.judging.heading': 'Where to find each judging area',
    'about.judging.caption': 'The six judging areas, mapped to Ruko',
    'about.judging.col.area': 'Judging area',
    'about.judging.col.ruko': 'In Ruko',
    'about.judging.ux': 'UX flows',
    'about.judging.ux.body':
      'Organised by time: before, during and after a scam call. One Ruko button opens a calm card without hanging up, and every next step is one clear action.',
    'about.judging.visual': 'Visual UI',
    'about.judging.visual.body':
      'Warm paper and trust teal, red only for danger, one big main action per screen, and a drawn caller that is clearly practice.',
    'about.judging.a11y': 'Accessibility and inclusive design',
    'about.judging.a11y.body':
      'Aims for WCAG 2.2 AA: text to 200%, high contrast, Easy Read, Hindi, read aloud, 48-pixel targets and axe tests. See the Accessibility label.',
    'about.judging.ia': 'Interaction and information architecture',
    'about.judging.ia.body':
      'Before, During and After instead of feature menus, one question per page, and Help in the same place on every screen.',
    'about.judging.original': 'Problem-solving and originality',
    'about.judging.original.body':
      'Built for the frightened moment and a second person: calm-moment rules, a silent family alert, a family code word and a golden-hour plan.',
    'about.judging.polish': 'Polish',
    'about.judging.polish.body':
      'Undo instead of “Are you sure?”, gentle screen transitions, spoken words that match the screen, and the calm card working offline.',

    'about.rejected.heading': 'What we chose not to build',
    'about.rejected.title': 'An AI verdict checker',
    'about.rejected.body': 'Paste a message, get “scam” or “safe”. We dropped it because:',
    'about.rejected.r1': 'A frightened person held on a live video call cannot copy, paste and wait.',
    'about.rejected.r2': 'A confident “safe” from a wrong guess is more dangerous than no answer.',
    'about.rejected.r3': 'It leaves the family out at the exact moment they could help.',
    'about.rejected.instead':
      'Instead, Ruko asks three plain yes, no or not-sure questions and shows exactly which answers matched.',

    'about.explore.heading': 'Explore',
    'about.explore.demo': 'See both phones side by side',
    'about.explore.accessibility': 'Read the Accessibility label',

    'about.sources.heading': 'Sources',
    'about.source.i4c':
      'Indian Cybercrime Coordination Centre (I4C), Ministry of Home Affairs: “digital arrest” advisories and 2024 loss figures.',
    'about.source.rbi':
      'Reserve Bank of India: discussion paper proposing a delay on large transfers and trusted-person approval for customers aged 70 and above.',
    'about.source.helplines':
      '1930 National Cyber Crime Helpline, cybercrime.gov.in, 112 emergency, and Sanchar Saathi (Chakshu) for reporting suspicious numbers.',
    'about.source.wcag':
      'W3C: Web Content Accessibility Guidelines (WCAG) 2.2 and cognitive accessibility guidance (COGA).',
    'about.source.apple': 'Apple Human Interface Guidelines and App Store Accessibility Nutrition Labels.',
    'about.source.nng': 'Nielsen Norman Group: research on designing for older adults.',
    'about.credits': 'Built for Hyperbloom October 2026.',
    'about.credits.local': 'Everything runs on this phone. No accounts, no tracking, no servers.',

    'about.note.tour.title': 'A tour for busy judges',
    'about.note.tour.body':
      'Judges have minutes, not hours. One tap loads a believable family and turns these notes on everywhere, so each reason sits next to the screen it explains.',
    'about.note.rejected.title': 'Why rules beat a verdict',
    'about.note.rejected.body':
      'People trust what they can check. “They asked you to keep it secret” is a sign Kamla can verify herself and repeat to Rahul.',
  },
  hi: {
    'about.title': 'रुको कैसे डिज़ाइन किया गया',
    'about.lead':
      'रुको किसी की ज़िंदगी की सबसे डरावनी कॉल के बीच एक शांत “रुकिए” बटन है, और किसी अपने को चुपचाप साथ जोड़ने का तरीक़ा।',
    'about.lead.easy': 'रुको डरावनी कॉल के बीच रुकने और परिवार से मदद लेने में मदद करता है।',

    'about.tour.heading': '60 सेकंड में देखें',
    'about.tour.button': '60 सेकंड का टूर शुरू करें',
    'about.tour.hint':
      'डेमो परिवार (कमला और राहुल) जुड़ जाएगा, पीले डिज़ाइन नोट चालू होंगे और आप होम स्क्रीन पर पहुँचेंगे।',
    'about.tour.replaceWarning': 'इससे इस फ़ोन की सेटिंग की जगह डेमो परिवार आ जाएगा। आप इसे वापस ले सकते हैं।',
    'about.tour.toast': 'टूर शुरू हो गया। अब हर स्क्रीन पर पीले डिज़ाइन नोट दिखेंगे। बल्ब का निशान देखिए।',
    'about.notes.label': 'हर स्क्रीन पर डिज़ाइन नोट दिखाएँ',
    'about.notes.desc': 'छोटे पीले नोट बताते हैं कि हर स्क्रीन के पीछे क्या सोच है।',

    'about.problem.heading': 'समस्या',
    'about.problem.crore': '{amount} करोड़',
    'about.problem.lostLabel': '2024 में भारत में “डिजिटल अरेस्ट” ठगी में गँवाए गए',
    'about.problem.complaintsValue': '1.23 लाख',
    'about.problem.complaintsLabel': '2024 में डिजिटल अरेस्ट की शिकायतें',
    'about.problem.cyberLabel': '2024 में भारत में हर तरह की साइबर ठगी में गँवाए गए',
    'about.problem.how':
      'ठग वीडियो कॉल पर अफ़सर बनकर आते हैं, व्यक्ति को कैमरे के सामने बिठाए रखते हैं, किसी को बताने से मना करते हैं और पैसे “सुरक्षित खाते” में भेजने का दबाव डालते हैं।',
    'about.problem.how.easy': 'नकली अफ़सर लोगों को वीडियो कॉल पर रोके रखते हैं। कहते हैं: किसी को मत बताओ, पैसे भेजो।',
    'about.problem.fact':
      'भारत के क़ानून में “डिजिटल अरेस्ट” जैसा कुछ नहीं है। CBI, पुलिस, ED, RBI या कस्टम कभी वीडियो कॉल पर गिरफ़्तार नहीं करते, न पैसे माँगते हैं। असली एजेंसियाँ लिखित नोटिस भेजती हैं।',
    'about.problem.source': 'आँकड़े: भारतीय साइबर अपराध समन्वय केंद्र (I4C), गृह मंत्रालय।',

    'about.insight.heading': 'सबसे ज़रूरी समझ',
    'about.insight.body':
      'ठगी के शिकार लोग डरे हुए, अकेले होते हैं और उन्हें चुप रहने को कहा जाता है। ज़्यादातर ठगी-जाँच ऐप कहते हैं “संदेश चिपकाइए और फ़ैसला पाइए”, जो चलती वीडियो कॉल पर फँसे व्यक्ति के काम नहीं आता। इसलिए रुको डर के उसी पल के लिए बना है, और किसी दूसरे अपने के लिए भी।',
    'about.insight.body.easy':
      'ऐसी कॉल पर लोग डरे और अकेले होते हैं। रुको उसी पल के लिए बना है, और मदद करने वाले अपने के लिए भी।',

    'about.personas.heading': 'हमने किनके लिए बनाया',
    'about.persona.kamla.name': 'कमला देवी, 68',
    'about.persona.kamla.facts': 'पुणे · पहले हिंदी पढ़ती हैं · छोटे भुगतान UPI से करती हैं · अकेली रहती हैं',
    'about.persona.kamla.need':
      'उन्हें चाहिए एक शांत, बड़ा, एक अँगूठे से दबने वाला तरीक़ा, जिससे वे रुक सकें और मदद ले सकें, पुलिस जैसे लगने वाले व्यक्ति का फ़ोन काटे बिना।',
    'about.persona.rahul.name': 'राहुल, 34',
    'about.persona.rahul.facts': 'उनका बेटा · बेंगलुरु में काम करता है · लंबे, व्यस्त दिन',
    'about.persona.rahul.need':
      'उसे चाहिए ज़रूरत के समय एक साफ़ सूचना, और एक टैप में कॉल करने, मंज़ूरी देने या रोकने का तरीक़ा। निगरानी नहीं।',

    'about.principles.heading': 'डिज़ाइन के चार नियम',
    'about.principle.calm.title': 'चतुराई से पहले शांति',
    'about.principle.calm.body':
      'सीधे शब्द, हर स्क्रीन पर एक बड़ा काम, कोई अलार्म नहीं। डर इंसान को जमा देता है; शांति सोचने में मदद करती है।',
    'about.principle.friction.title': 'रुकावट, जो आप ख़ुद चुनें',
    'about.principle.friction.body':
      'कमला शांत मन से अपने नियम ख़ुद बनाती हैं, जैसे “किसी नए व्यक्ति को {amount} से ज़्यादा भेजने से पहले एक घंटा रुको”। रुको अपने-आप कभी कुछ नहीं रोकता।',
    'about.principle.dignity.title': 'सम्मान के साथ परिवार का साथ',
    'about.principle.dignity.body':
      'राहुल क्या देख सकता है, यह कमला तय करती हैं, और एक टैप में बंद भी कर सकती हैं। मदद, निगरानी नहीं।',
    'about.principle.explain.title': 'ऐसे नियम जो समझाए जा सकें',
    'about.principle.explain.body': 'कोई छुपा हुआ फ़ैसला नहीं। हर चेतावनी साफ़ बताती है कि किस जवाब की वजह से आई।',

    'about.judging.heading': 'जजों के हर पैमाने को कहाँ देखें',
    'about.judging.caption': 'जजों के छह पैमाने, रुको में कहाँ हैं',
    'about.judging.col.area': 'पैमाना',
    'about.judging.col.ruko': 'रुको में',
    'about.judging.ux': 'UX फ़्लो',
    'about.judging.ux.body':
      'समय के हिसाब से बँटा: ठगी वाली कॉल से पहले, दौरान और बाद में। एक रुको बटन फ़ोन काटे बिना शांत कार्ड खोलता है, और हर अगला क़दम एक साफ़ काम है।',
    'about.judging.visual': 'दिखावट (विज़ुअल UI)',
    'about.judging.visual.body':
      'गर्म काग़ज़ जैसा रंग और भरोसे का हरा-नीला, लाल सिर्फ़ ख़तरे के लिए, हर स्क्रीन पर एक बड़ा मुख्य काम, और बना हुआ कॉलर जो साफ़ अभ्यास लगता है।',
    'about.judging.a11y': 'सुलभता और सबको साथ लेने वाला डिज़ाइन',
    'about.judging.a11y.body':
      'लक्ष्य WCAG 2.2 AA: 200% तक अक्षर, ज़्यादा कंट्रास्ट, आसान भाषा, हिंदी, पढ़कर सुनाना, 48 पिक्सेल के बटन और axe टेस्ट। सुलभता लेबल देखें।',
    'about.judging.ia': 'इंटरैक्शन और जानकारी की बनावट',
    'about.judging.ia.body':
      'सुविधाओं की सूची की जगह पहले, दौरान और बाद में; एक पेज पर एक सवाल; और हर स्क्रीन पर एक ही जगह मदद।',
    'about.judging.original': 'समस्या का हल और नयापन',
    'about.judging.original.body':
      'डर के पल और दूसरे अपने के लिए बना: शांत मन से बने नियम, परिवार को चुपचाप सूचना, परिवार का गुप्त शब्द और गोल्डन आवर की योजना।',
    'about.judging.polish': 'बारीकी',
    'about.judging.polish.body':
      '“क्या आप पक्का हैं?” की जगह “वापस लें”, स्क्रीन के बीच हल्के बदलाव, स्क्रीन से मेल खाते बोले गए शब्द, और बिना इंटरनेट चलने वाला शांत कार्ड।',

    'about.rejected.heading': 'हमने क्या नहीं बनाया',
    'about.rejected.title': 'AI से फ़ैसला सुनाने वाला चेकर',
    'about.rejected.body': 'संदेश चिपकाइए, “ठगी” या “सुरक्षित” पाइए। हमने इसे छोड़ दिया, क्योंकि:',
    'about.rejected.r1': 'चलती वीडियो कॉल पर फँसा डरा हुआ व्यक्ति कॉपी, पेस्ट करके इंतज़ार नहीं कर सकता।',
    'about.rejected.r2': 'ग़लत अंदाज़े से मिला पक्का “सुरक्षित” कोई जवाब न मिलने से ज़्यादा ख़तरनाक है।',
    'about.rejected.r3': 'इसमें परिवार ठीक उसी पल बाहर रह जाता है, जब वह मदद कर सकता है।',
    'about.rejected.instead':
      'इसकी जगह रुको तीन सीधे सवाल पूछता है, हाँ, नहीं या पक्का नहीं पता, और साफ़ दिखाता है कि कौन-से जवाब मेल खाए।',

    'about.explore.heading': 'और देखें',
    'about.explore.demo': 'दोनों फ़ोन साथ-साथ देखें',
    'about.explore.accessibility': 'सुलभता लेबल पढ़ें',

    'about.sources.heading': 'स्रोत',
    'about.source.i4c':
      'भारतीय साइबर अपराध समन्वय केंद्र (I4C), गृह मंत्रालय: “डिजिटल अरेस्ट” पर चेतावनियाँ और 2024 के नुक़सान के आँकड़े।',
    'about.source.rbi':
      'भारतीय रिज़र्व बैंक: चर्चा पत्र, जिसमें बड़े ट्रांसफ़र पर देरी और 70 साल या उससे ज़्यादा उम्र के ग्राहकों के लिए भरोसेमंद व्यक्ति की मंज़ूरी का सुझाव है।',
    'about.source.helplines':
      '1930 राष्ट्रीय साइबर क्राइम हेल्पलाइन, cybercrime.gov.in, 112 आपातकाल, और संदिग्ध नंबरों की शिकायत के लिए संचार साथी (चक्षु)।',
    'about.source.wcag': 'W3C: वेब कंटेंट एक्सेसिबिलिटी गाइडलाइन (WCAG) 2.2 और समझने में आसानी की गाइडलाइन (COGA)।',
    'about.source.apple': 'Apple की Human Interface Guidelines और App Store के सुलभता लेबल।',
    'about.source.nng': 'Nielsen Norman Group: बुज़ुर्गों के लिए डिज़ाइन पर शोध।',
    'about.credits': 'Hyperbloom अक्टूबर 2026 के लिए बनाया गया।',
    'about.credits.local': 'सब कुछ इसी फ़ोन पर चलता है। न अकाउंट, न ट्रैकिंग, न सर्वर।',

    'about.note.tour.title': 'व्यस्त जजों के लिए टूर',
    'about.note.tour.body':
      'जजों के पास घंटे नहीं, मिनट होते हैं। एक टैप से एक असली-सा परिवार जुड़ जाता है और ये नोट हर जगह चालू हो जाते हैं, ताकि हर वजह उसी स्क्रीन के पास दिखे जिसे वह समझाती है।',
    'about.note.rejected.title': 'फ़ैसले से बेहतर नियम क्यों',
    'about.note.rejected.body':
      'लोग उस पर भरोसा करते हैं जिसे वे ख़ुद जाँच सकें। “उन्होंने बात छुपाने को कहा” ऐसा संकेत है जिसे कमला ख़ुद परख सकती हैं और राहुल को बता सकती हैं।',
  },
}
