import type { FeatureStrings } from '../../i18n/types'

/**
 * Script check copy. Key names follow src/lib/scamSignals.ts:
 *   check.q.<id> (question = page title), check.q.<id>.help (why we ask),
 *   check.reason.<id> (what matched) + check.fact.<id> (what real officers do instead).
 */
export const strings: FeatureStrings = {
  en: {
    'check.title': 'Check this call',

    // ---------- Questions (one per page) ----------
    'check.q.secrecy': 'Did they tell you to keep this secret, even from your family?',
    'check.q.secrecy.help': 'Scammers say the case is secret so that no one in your family can warn you.',
    'check.q.secrecy.help.easy': 'Scammers want you to tell no one. Then no one can warn you.',
    'check.q.moneyMove': 'Did they ask you to move money to a safe or verification account?',
    'check.q.moneyMove.help':
      'Scammers may call it a safe account, an RBI account or a check of your money. It is really their own account.',
    'check.q.moneyMove.help.easy': 'A “safe account” is really the scammer’s own account.',
    'check.q.videoHold': 'Are they keeping you on a video call, or telling you not to hang up?',
    'check.q.videoHold.help': 'Scammers keep you on camera so you cannot stop, think or call someone you trust.',
    'check.q.videoHold.help.easy': 'Scammers keep you on camera. Then you cannot stop and think.',
    'check.why': 'Why we ask',
    'check.notSureHint': 'It is okay not to know.',
    'check.error': 'Please choose one answer. If you do not know, choose Not sure.',
    'check.error.easy': 'Choose one answer. Not sure is fine.',
    'check.seeResult': 'See the result',

    'check.note.onePage.title': 'One question per page',
    'check.note.onePage.body':
      'GOV.UK found that one question per page helps people who are less confident online. Not sure is always allowed, so nobody has to guess, and each answer is saved the moment it is tapped.',
    'check.note.continue.title': 'A clear message, not a grey button',
    'check.note.continue.body':
      'Continue is never disabled, because a greyed-out button does not say what is wrong. If nothing is chosen, a short message says what to do and takes the focus, so screen readers hear it too.',

    // ---------- Result: headline ----------
    'check.result.scam.title': 'This matches a digital-arrest scam.',
    'check.result.unsure.title': 'Treat this call as a scam until {person} checks.',
    'check.result.unsure.titleNoPerson': 'Treat this call as a scam until someone you trust checks.',
    'check.result.clear.title': 'No warning signs from your answers.',
    'check.result.reassure': 'You did the right thing by stopping to check.',
    'check.result.reassure.easy': 'Stopping to check was right.',

    // ---------- Result: why ----------
    'check.result.scam.why': 'Why Ruko says this',
    'check.result.unsure.why': 'Some answers were not sure',
    'check.result.missing.why': 'Some questions are not answered yet',
    'check.result.unsure.lead': 'When you are not sure, the safest thing is to pause and let {person} check with you.',
    'check.result.unsure.lead.easy': 'Not sure? Pause. Let {person} check with you.',
    'check.result.unsure.leadNoPerson':
      'When you are not sure, the safest thing is to pause and let someone you trust check with you.',
    'check.result.unsure.leadNoPerson.easy': 'Not sure? Pause. Let someone you trust check.',
    'check.result.clear.why': 'Still, stay careful',

    'check.reason.secrecy': 'They asked you to keep it secret.',
    'check.reason.moneyMove': 'They asked you to move money to a “safe” account.',
    'check.reason.videoHold': 'They are keeping you on a video call.',
    'check.fact.secrecy': 'Real police never ask you to hide an investigation from your family.',
    'check.fact.secrecy.easy': 'Real police never ask you to hide things from family.',
    'check.fact.moneyMove': 'Real officers and the RBI never ask you to move money to keep it safe or to check it.',
    'check.fact.moneyMove.easy': 'Real officers never ask you to move money.',
    'check.fact.videoHold': 'Real officers never arrest anyone on a video call. You are free to hang up.',
    'check.fact.videoHold.easy': 'No one is arrested on a video call. You can hang up.',

    'check.unsure.secrecy': 'You were not sure if they asked you to keep it secret.',
    'check.unsure.moneyMove': 'You were not sure if they asked you to move money.',
    'check.unsure.videoHold': 'You were not sure if they are keeping you on the call.',
    'check.missing.secrecy': 'You have not answered the question about keeping it secret.',
    'check.missing.moneyMove': 'You have not answered the question about moving money.',
    'check.missing.videoHold': 'You have not answered the question about the video call.',
    'check.result.answerMissing': 'Answer the remaining questions',

    'check.tip.otp': 'Never share an OTP or PIN. An OTP is the code that comes in an SMS.',
    'check.tip.otp.easy': 'Never share an OTP or PIN.',
    'check.tip.money': 'Never move money while you are on a call.',
    'check.tip.ruko': 'If anything feels wrong, press Ruko.',

    // ---------- Result: next steps ----------
    'check.result.next': 'What to do now',
    'check.result.hangUp': 'It is safe to hang up now.',
    'check.result.hangUpBody': 'You do not have to explain anything to the caller.',
    'check.result.tell': 'Tell {name}',
    'check.result.tellHint': '{name} gets a quiet message. The caller will not know.',
    'check.result.tellHint.easy': 'A quiet message to {name}. The caller will not know.',
    'check.result.tellNoPerson': 'Tell someone you trust',
    'check.result.tellNoPersonHint': 'First add a trusted person. It takes about a minute.',
    'check.result.told': 'You told {name} at {time}.',
    'check.result.call1930': 'Call 1930',
    'check.result.call1930Hint': 'National Cyber Crime Helpline. You can report this call there.',
    'check.result.pressured': 'They are pushing me to send money',
    'check.result.pressuredHint': 'Open your bank app through Ruko. If the money is going to someone new, your rule pauses it. (Demo bank app)',
    'check.result.call1930Hint.easy': 'The cyber crime helpline.',
    'check.result.home': 'Back to home',

    // ---------- Result: what real officers do ----------
    'check.officers.title': 'What real officers do',
    'check.officers.notice': 'They send a written notice.',
    'check.officers.money': 'They never ask you for money, or to move money.',
    'check.officers.video': 'They never arrest anyone on a video call.',
    'check.officers.law': 'There is no “digital arrest” in Indian law.',

    // ---------- Result: your answers ----------
    'check.answers.title': 'Your answers',
    'check.topic.secrecy': 'Told to keep it secret',
    'check.topic.moneyMove': 'Asked to move money',
    'check.topic.videoHold': 'Kept on a video call',
    'check.answer.notAnswered': 'Not answered',
    'check.result.change': 'Change my answers',
    'check.result.changeHint': 'Your answers stay filled in. Change any you like.',

    'check.note.rules.title': 'Rules you can explain, not an AI verdict',
    'check.note.rules.body':
      'NN/g found that people over-trust confident AI answers and rarely check the sources behind them. So Ruko uses three fixed rules and shows exactly which answer led to this result.',
    'check.note.unsure.title': 'Not sure means pause',
    'check.note.unsure.body':
      'Every question offers Not sure (Scottish Government design system). Ruko treats Not sure as a reason to check with family, so doubt never turns into a false all-clear.',
  },
  hi: {
    'check.title': 'इस कॉल की जाँच करें',

    'check.q.secrecy': 'क्या उन्होंने आपसे यह बात छिपाकर रखने को कहा, अपने परिवार से भी?',
    'check.q.secrecy.help': 'ठग कहते हैं कि मामला गुप्त है, ताकि आपके परिवार में कोई आपको सावधान न कर सके।',
    'check.q.secrecy.help.easy': 'ठग चाहते हैं कि आप किसी को न बताएँ। तब कोई आपको सावधान नहीं कर पाएगा।',
    'check.q.moneyMove': 'क्या उन्होंने आपसे पैसे किसी "सेफ़" या "वेरिफ़िकेशन" खाते में भेजने को कहा?',
    'check.q.moneyMove.help':
      'ठग इसे "सेफ़ खाता", "RBI खाता" या "पैसों की जाँच" कहते हैं। असल में वह उन्हीं का अपना खाता होता है।',
    'check.q.moneyMove.help.easy': '"सेफ़ खाता" असल में ठग का अपना खाता होता है।',
    'check.q.videoHold': 'क्या वे आपको वीडियो कॉल पर रोके हुए हैं, या फ़ोन न काटने को कह रहे हैं?',
    'check.q.videoHold.help':
      'ठग आपको कैमरे के सामने रखते हैं, ताकि आप रुककर सोच न सकें और किसी भरोसेमंद को फ़ोन न कर सकें।',
    'check.q.videoHold.help.easy': 'ठग आपको कैमरे के सामने रखते हैं। तब आप रुककर सोच नहीं पाते।',
    'check.why': 'हम यह क्यों पूछ रहे हैं',
    'check.notSureHint': 'न पता हो, तो भी कोई बात नहीं।',
    'check.error': 'कृपया एक जवाब चुनिए। अगर पक्का नहीं पता, तो "पक्का नहीं पता" चुन लीजिए।',
    'check.error.easy': 'एक जवाब चुनिए। "पक्का नहीं पता" भी ठीक है।',
    'check.seeResult': 'नतीजा देखें',

    'check.note.onePage.title': 'एक पेज पर एक सवाल',
    'check.note.onePage.body':
      'GOV.UK ने पाया कि एक पेज पर एक ही सवाल होने से उन लोगों को मदद मिलती है जिन्हें ऑनलाइन काम करने में कम भरोसा होता है। "पक्का नहीं पता" हमेशा चुना जा सकता है, ताकि किसी को अंदाज़ा न लगाना पड़े, और हर जवाब दबाते ही सेव हो जाता है।',
    'check.note.continue.title': 'धुँधला बटन नहीं, साफ़ संदेश',
    'check.note.continue.body':
      '"आगे बढ़ें" बटन कभी बंद नहीं होता, क्योंकि धुँधला बटन यह नहीं बताता कि कमी क्या है। अगर कुछ नहीं चुना गया, तो एक छोटा संदेश बताता है कि क्या करना है और फ़ोकस उसी पर जाता है, ताकि स्क्रीन रीडर भी उसे पढ़कर सुना सके।',

    'check.result.scam.title': 'यह डिजिटल अरेस्ट वाले धोखे से मेल खाता है।',
    'check.result.unsure.title': 'जब तक {person} जाँच न लें, इस कॉल को धोखा ही मानिए।',
    'check.result.unsure.titleNoPerson': 'जब तक कोई भरोसेमंद व्यक्ति जाँच न ले, इस कॉल को धोखा ही मानिए।',
    'check.result.clear.title': 'आपके जवाबों में ख़तरे का कोई निशान नहीं मिला।',
    'check.result.reassure': 'रुककर जाँच करके आपने बिल्कुल सही किया।',
    'check.result.reassure.easy': 'रुककर जाँचना सही था।',

    'check.result.scam.why': 'रुको ऐसा क्यों कह रहा है',
    'check.result.unsure.why': 'कुछ जवाब पक्के नहीं थे',
    'check.result.missing.why': 'कुछ सवालों के जवाब अभी बाक़ी हैं',
    'check.result.unsure.lead': 'जब पक्का न पता हो, तो रुकना और {person} से जाँच करवाना ही सबसे सुरक्षित है।',
    'check.result.unsure.lead.easy': 'पक्का नहीं पता? रुकिए। {person} को जाँचने दीजिए।',
    'check.result.unsure.leadNoPerson':
      'जब पक्का न पता हो, तो रुकना और किसी भरोसेमंद व्यक्ति से जाँच करवाना ही सबसे सुरक्षित है।',
    'check.result.unsure.leadNoPerson.easy': 'पक्का नहीं पता? रुकिए। किसी भरोसेमंद को जाँचने दीजिए।',
    'check.result.clear.why': 'फिर भी सावधान रहिए',

    'check.reason.secrecy': 'उन्होंने आपसे बात छिपाकर रखने को कहा।',
    'check.reason.moneyMove': 'उन्होंने आपसे पैसे किसी "सेफ़" खाते में भेजने को कहा।',
    'check.reason.videoHold': 'वे आपको वीडियो कॉल पर रोके हुए हैं।',
    'check.fact.secrecy': 'असली पुलिस कभी नहीं कहती कि जाँच की बात अपने परिवार से छिपाइए।',
    'check.fact.secrecy.easy': 'असली पुलिस कभी परिवार से बात छिपाने को नहीं कहती।',
    'check.fact.moneyMove': 'असली अफ़सर या RBI कभी पैसे "सुरक्षित रखने" या "जाँच" के लिए कहीं भेजने को नहीं कहते।',
    'check.fact.moneyMove.easy': 'असली अफ़सर कभी पैसे भेजने को नहीं कहते।',
    'check.fact.videoHold': 'असली अफ़सर कभी किसी को वीडियो कॉल पर गिरफ़्तार नहीं करते। फ़ोन काटना बिल्कुल ठीक है।',
    'check.fact.videoHold.easy': 'वीडियो कॉल पर कोई गिरफ़्तारी नहीं होती। फ़ोन काट दीजिए।',

    'check.unsure.secrecy': 'आपको पक्का नहीं पता कि उन्होंने बात छिपाने को कहा या नहीं।',
    'check.unsure.moneyMove': 'आपको पक्का नहीं पता कि उन्होंने पैसे भेजने को कहा या नहीं।',
    'check.unsure.videoHold': 'आपको पक्का नहीं पता कि वे आपको कॉल पर रोके हुए हैं या नहीं।',
    'check.missing.secrecy': 'बात छिपाने वाले सवाल का जवाब अभी नहीं दिया गया है।',
    'check.missing.moneyMove': 'पैसे भेजने वाले सवाल का जवाब अभी नहीं दिया गया है।',
    'check.missing.videoHold': 'वीडियो कॉल वाले सवाल का जवाब अभी नहीं दिया गया है।',
    'check.result.answerMissing': 'बाक़ी सवालों के जवाब दें',

    'check.tip.otp': 'OTP या PIN कभी किसी को न बताएँ। OTP वह कोड है जो SMS में आता है।',
    'check.tip.otp.easy': 'OTP या PIN कभी किसी को न बताएँ।',
    'check.tip.money': 'कॉल पर रहते हुए कभी पैसे न भेजें।',
    'check.tip.ruko': 'कुछ भी ग़लत लगे, तो रुको दबाएँ।',

    'check.result.next': 'अब क्या करें',
    'check.result.hangUp': 'अब फ़ोन काट देना पूरी तरह सुरक्षित है।',
    'check.result.hangUpBody': 'कॉल करने वाले को कुछ भी समझाने की ज़रूरत नहीं है।',
    'check.result.tell': '{name} को बताएँ',
    'check.result.tellHint': '{name} को चुपचाप एक संदेश जाएगा। कॉल करने वाले को पता नहीं चलेगा।',
    'check.result.tellHint.easy': '{name} को चुपचाप संदेश जाएगा। कॉल करने वाले को पता नहीं चलेगा।',
    'check.result.tellNoPerson': 'किसी भरोसेमंद को बताएँ',
    'check.result.tellNoPersonHint': 'पहले किसी भरोसेमंद व्यक्ति को जोड़िए। इसमें लगभग एक मिनट लगता है।',
    'check.result.told': 'आपने {time} पर {name} को बता दिया था।',
    'check.result.call1930': '1930 पर कॉल करें',
    'check.result.call1930Hint': 'राष्ट्रीय साइबर क्राइम हेल्पलाइन। वहाँ इस कॉल की शिकायत की जा सकती है।',
    'check.result.pressured': 'वे मुझ पर पैसे भेजने का दबाव डाल रहे हैं',
    'check.result.pressuredHint': 'बैंक ऐप रुको के ज़रिए खोलिए। अगर पैसा किसी नए व्यक्ति को जा रहा है, तो आपका नियम उसे रोक देगा। (डेमो बैंक ऐप)',
    'check.result.call1930Hint.easy': 'साइबर क्राइम हेल्पलाइन।',
    'check.result.home': 'होम पर वापस जाएँ',

    'check.officers.title': 'असली अफ़सर क्या करते हैं',
    'check.officers.notice': 'वे लिखकर नोटिस भेजते हैं।',
    'check.officers.money': 'वे कभी पैसे नहीं माँगते, न ही पैसे कहीं भेजने को कहते हैं।',
    'check.officers.video': 'वे कभी किसी को वीडियो कॉल पर गिरफ़्तार नहीं करते।',
    'check.officers.law': 'भारत के क़ानून में "डिजिटल अरेस्ट" जैसा कुछ नहीं होता।',

    'check.answers.title': 'आपके जवाब',
    'check.topic.secrecy': 'बात छिपाने को कहा',
    'check.topic.moneyMove': 'पैसे भेजने को कहा',
    'check.topic.videoHold': 'वीडियो कॉल पर रोके रखा',
    'check.answer.notAnswered': 'जवाब नहीं दिया',
    'check.result.change': 'मेरे जवाब बदलें',
    'check.result.changeHint': 'आपके जवाब भरे रहेंगे। जो चाहें, बदल लीजिए।',

    'check.note.rules.title': 'समझाए जा सकने वाले नियम, AI का फ़ैसला नहीं',
    'check.note.rules.body':
      'NN/g ने पाया कि लोग आत्मविश्वास से भरे AI जवाबों पर ज़रूरत से ज़्यादा भरोसा करते हैं और उनके स्रोत शायद ही कभी जाँचते हैं। इसलिए रुको तीन तय नियमों से चलता है और साफ़ दिखाता है कि किस जवाब से यह नतीजा निकला।',
    'check.note.unsure.title': '"पक्का नहीं पता" का मतलब है: रुकिए',
    'check.note.unsure.body':
      'हर सवाल में "पक्का नहीं पता" चुनने का विकल्प है (स्कॉटिश सरकार का डिज़ाइन सिस्टम)। रुको इसे परिवार से जाँच करवाने की वजह मानता है, ताकि शक कभी ग़लत "सब ठीक है" में न बदले।',
  },
}
