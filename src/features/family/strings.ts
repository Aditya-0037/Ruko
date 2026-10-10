import type { FeatureStrings } from '../../i18n/types'

export const strings: FeatureStrings = {
  en: {
    'family.title': '{person}’s phone',
    'family.titleNoPerson': 'Family phone',
    'family.role': 'Family view',
    'family.roleFor': 'You are {elder}’s trusted person. {elder} decides what you see.',
    'family.maa': 'Maa',
    'family.elderFallback': 'your family member',

    /* ---------- nothing happening ---------- */
    'family.quiet.title': 'All quiet.',
    'family.quiet.body': 'Ruko tells you only when {elder} needs you.',
    'family.quiet.whenTitle': 'When Ruko will tell you',
    'family.quiet.whenAlert': 'When {elder} presses Ruko during a call and chooses to tell you.',
    'family.quiet.whenTransfer': 'When {elder}’s own rule pauses a big payment to someone new.',
    'family.quiet.alertsOff': '{elder} chose not to send alerts during calls.',
    'family.quiet.transferNotShared': '{elder} chose not to share payment details, so you will not see payments here.',
    'family.quiet.neverTitle': 'What you never see',
    'family.quiet.never': '{elder}’s messages, bank balance or location.',
    'family.example.caption': 'Example: this is what an alert looks like',
    'family.example.badge': 'Example',
    'family.setup.title': 'Ruko is not set up on this phone yet',
    'family.setup.body': 'To try the family view, load the demo family: Kamla Devi and her son Rahul.',
    'family.setup.load': 'Load the demo family',

    /* ---------- the alert ---------- */
    'family.alert.badge': 'Alert',
    'family.alert.title': '{elder} opened Ruko during a call. Possible digital-arrest scam.',
    'family.alert.caller': 'The caller says they are from {caller}.',
    'family.callerDefault': 'CBI Mumbai',
    'family.time.justNow': 'Just now',
    'family.time.minutes': '{count} min ago',
    'family.callElder': 'Call {elder}',

    /* ---------- calling ---------- */
    'family.calling.title': 'Calling {elder}…',
    'family.calling.simulated': 'Practice call. No real call is made.',
    'family.calling.shown': 'On {elder}’s phone, Ruko now says you are calling.',
    'family.calling.sayTitle': 'What to say',
    'family.calling.say1': 'Stay calm and kind. {elder} is not in trouble.',
    'family.calling.say2': 'Ask {elder} to hang up. Real police never arrest anyone on a video call.',
    'family.calling.say3': 'Say your family code word, so {elder} knows it is really you.',
    'family.calling.end': 'End call',

    /* ---------- the paused transfer ---------- */
    'family.transfer.badge': 'Payment paused',
    'family.transfer.badge.blocked': 'Payment blocked',
    'family.transfer.badge.cancelled': 'Payment cancelled',
    'family.transfer.badge.approved': 'Payment approved',
    'family.transfer.badge.sent': 'Payment sent',
    'family.transfer.title.new': '{elder} is trying to send {amount} to a new person ({payee}). Ruko paused it {waitFor}.',
    'family.transfer.title.saved': '{elder} is trying to send {amount} to {payee}. Ruko paused it {waitFor}.',
    'family.transfer.unlocks': 'The wait ends in {count} min, unless you decide first.',
    'family.transfer.unlocksSoon': 'The wait ends in less than a minute, unless you decide first.',
    'family.transfer.unlocked': 'The wait is over. The payment can now be sent.',
    'family.transfer.block': 'Block this transfer',
    'family.transfer.approve': 'Approve sending {amount}',
    'family.transfer.blocked': 'You blocked this transfer. {elder}’s {amount} is safe.',
    'family.transfer.blockedTold': 'Ruko has told {elder} on their phone.',
    'family.transfer.approved': 'You approved sending {amount}. The payment can now be sent.',
    'family.transfer.undoApproval': 'Undo approval',
    'family.transfer.cancelled': '{elder} cancelled this transfer. The {amount} is safe.',
    'family.transfer.sent': '{elder} sent {amount} after the wait.',
    'family.transfer.sentHelp':
      'If this was a scam, help {elder} call 1930 now. Acting in the first hour gives the bank the best chance to hold the money.',
    'family.transfer.sentHelp.easy': 'If this was a scam, help {elder} call 1930 now. The first hour matters most.',
    'family.transfer.call1930': 'Call 1930',
    'family.toast.approved': 'You approved sending {amount}.',
    'family.toast.restored': 'Approval undone. The payment is paused again.',

    /* ---------- dignity ---------- */
    'family.notShared.title': '{elder} chose not to share transfer details.',
    'family.notShared.body': 'Payments stay private. If {elder} needs you, they can call you from Ruko.',

    /* ---------- check answers ---------- */
    'family.signs.title': '{elder}’s answers to Ruko’s check',
    'family.signs.yesIntro': 'Said yes to these scam signs:',
    'family.signs.unsureIntro': 'Not sure about:',
    'family.signs.clear': 'Answered no to all three scam signs. Call to be sure.',
    'family.sign.secrecy': 'Told to keep it secret, even from family',
    'family.sign.moneyMove': 'Asked to move money to a “safe” account',
    'family.sign.videoHold': 'Kept on video and told not to hang up',

    /* ---------- design notes ---------- */
    'family.note.calm.title': 'Calm technology: only critical alerts',
    'family.note.calm.body':
      'Following Calm Technology principles, Rahul’s phone stays silent until Maa asks for help or her own rule pauses a big payment. Fewer alerts means the one that comes is taken seriously.',
    'family.note.dignity.title': 'Dignity first',
    'family.note.dignity.body':
      'Family sees only what the elder chose to share, said in words. Block is the main button, Approve is literal about the amount, and Approve can always be undone.',
  },
  hi: {
    'family.title': '{person} का फ़ोन',
    'family.titleNoPerson': 'परिवार का फ़ोन',
    'family.role': 'परिवार के लिए स्क्रीन',
    'family.roleFor': 'आप {elder} के भरोसेमंद व्यक्ति हैं। आप क्या देखेंगे, यह फ़ैसला {elder} का है।',
    'family.maa': 'माँ',
    'family.elderFallback': 'आपके परिजन',

    /* ---------- nothing happening ---------- */
    'family.quiet.title': 'सब शांत है।',
    'family.quiet.body': 'रुको आपको तभी बताता है, जब {elder} को आपकी ज़रूरत हो।',
    'family.quiet.whenTitle': 'रुको आपको कब बताएगा',
    'family.quiet.whenAlert': 'जब {elder} कॉल के दौरान रुको दबाएँ और आपको बताना चुनें।',
    'family.quiet.whenTransfer': 'जब {elder} का अपना नियम किसी नए व्यक्ति को जा रहा बड़ा पेमेंट रोके।',
    'family.quiet.alertsOff': '{elder} ने कॉल के दौरान अलर्ट न भेजने का फ़ैसला किया है।',
    'family.quiet.transferNotShared':
      '{elder} ने पेमेंट की जानकारी साझा न करने का फ़ैसला किया है, इसलिए आपको यहाँ पेमेंट नहीं दिखेंगे।',
    'family.quiet.neverTitle': 'आपको क्या कभी नहीं दिखेगा',
    'family.quiet.never': '{elder} के मैसेज, बैंक बैलेंस या लोकेशन।',
    'family.example.caption': 'उदाहरण: अलर्ट ऐसा दिखता है',
    'family.example.badge': 'उदाहरण',
    'family.setup.title': 'इस फ़ोन पर रुको अभी सेट नहीं हुआ है',
    'family.setup.body': 'परिवार वाली स्क्रीन आज़माने के लिए डेमो परिवार लोड करें: कमला देवी और उनके बेटे राहुल।',
    'family.setup.load': 'डेमो परिवार लोड करें',

    /* ---------- the alert ---------- */
    'family.alert.badge': 'अलर्ट',
    'family.alert.title': '{elder} ने कॉल के दौरान रुको खोला। हो सकता है यह डिजिटल अरेस्ट ठगी हो।',
    'family.alert.caller': 'कॉल करने वाला ख़ुद को {caller} से बता रहा है।',
    'family.callerDefault': 'सीबीआई मुंबई',
    'family.time.justNow': 'अभी-अभी',
    'family.time.minutes': '{count} मिनट पहले',
    'family.callElder': '{elder} को कॉल करें',

    /* ---------- calling ---------- */
    'family.calling.title': '{elder} को कॉल लग रही है…',
    'family.calling.simulated': 'यह अभ्यास कॉल है। असली कॉल नहीं होती।',
    'family.calling.shown': '{elder} के फ़ोन पर रुको अब बता रहा है कि आप कॉल कर रहे हैं।',
    'family.calling.sayTitle': 'क्या कहें',
    'family.calling.say1': 'शांत रहें और प्यार से बात करें। {elder} किसी मुसीबत में नहीं हैं।',
    'family.calling.say2': '{elder} से कॉल काटने को कहें। असली पुलिस कभी वीडियो कॉल पर गिरफ़्तार नहीं करती।',
    'family.calling.say3': 'अपना पारिवारिक कोड वर्ड बोलें, ताकि {elder} को यक़ीन हो कि यह सच में आप हैं।',
    'family.calling.end': 'कॉल काटें',

    /* ---------- the paused transfer ---------- */
    'family.transfer.badge': 'पेमेंट रुका हुआ',
    'family.transfer.badge.blocked': 'पेमेंट रोका गया',
    'family.transfer.badge.cancelled': 'पेमेंट रद्द हुआ',
    'family.transfer.badge.approved': 'पेमेंट मंज़ूर हुआ',
    'family.transfer.badge.sent': 'पेमेंट भेजा गया',
    'family.transfer.title.new':
      '{elder} ने एक नए व्यक्ति ({payee}) को {amount} भेजने की कोशिश की। रुको ने इसे {waitFor} रोक दिया है।',
    'family.transfer.title.saved': '{elder} ने {payee} को {amount} भेजने की कोशिश की। रुको ने इसे {waitFor} रोक दिया है।',
    'family.transfer.unlocks': 'अगर आप पहले फ़ैसला न करें, तो इंतज़ार {count} मिनट में ख़त्म होगा।',
    'family.transfer.unlocksSoon': 'अगर आप पहले फ़ैसला न करें, तो इंतज़ार एक मिनट से भी कम में ख़त्म होगा।',
    'family.transfer.unlocked': 'इंतज़ार पूरा हो गया है। अब यह पेमेंट भेजा जा सकता है।',
    'family.transfer.block': 'यह पेमेंट रोकें',
    'family.transfer.approve': '{amount} भेजने की मंज़ूरी दें',
    'family.transfer.blocked': 'आपने यह पेमेंट रोक दिया। {elder} के {amount} सुरक्षित हैं।',
    'family.transfer.blockedTold': 'रुको ने {elder} के फ़ोन पर यह बता दिया है।',
    'family.transfer.approved': 'आपने {amount} भेजने की मंज़ूरी दे दी। अब यह पेमेंट भेजा जा सकता है।',
    'family.transfer.undoApproval': 'मंज़ूरी वापस लें',
    'family.transfer.cancelled': '{elder} ने यह पेमेंट ख़ुद रद्द कर दिया। {amount} सुरक्षित हैं।',
    'family.transfer.sent': '{elder} ने इंतज़ार के बाद {amount} भेज दिए।',
    'family.transfer.sentHelp':
      'अगर यह ठगी थी, तो अभी 1930 पर कॉल करने में {elder} की मदद करें। पहले घंटे में क़दम उठाने से बैंक के पास पैसे रोकने का सबसे अच्छा मौक़ा होता है।',
    'family.transfer.sentHelp.easy': 'अगर यह ठगी थी, तो अभी 1930 पर कॉल करने में {elder} की मदद करें। पहला घंटा सबसे ज़रूरी है।',
    'family.transfer.call1930': '1930 पर कॉल करें',
    'family.toast.approved': 'आपने {amount} भेजने की मंज़ूरी दी।',
    'family.toast.restored': 'मंज़ूरी वापस ले ली गई। पेमेंट फिर से रुका हुआ है।',

    /* ---------- dignity ---------- */
    'family.notShared.title': '{elder} ने पेमेंट की जानकारी साझा न करने का फ़ैसला किया है।',
    'family.notShared.body': 'पेमेंट निजी रहेंगे। ज़रूरत होने पर {elder} रुको से आपको कॉल कर सकते हैं।',

    /* ---------- check answers ---------- */
    'family.signs.title': 'रुको की जाँच में {elder} के जवाब',
    'family.signs.yesIntro': 'इन ठगी के संकेतों पर "हाँ" कहा:',
    'family.signs.unsureIntro': 'इन पर पक्का नहीं पता:',
    'family.signs.clear': 'ठगी के तीनों संकेतों पर "नहीं" कहा। पक्का करने के लिए कॉल करें।',
    'family.sign.secrecy': 'बात छिपाकर रखने को कहा गया, परिवार से भी',
    'family.sign.moneyMove': 'पैसे किसी “सेफ़” खाते में डालने को कहा गया',
    'family.sign.videoHold': 'वीडियो कॉल पर रोके रखा और कॉल न काटने को कहा',

    /* ---------- design notes ---------- */
    'family.note.calm.title': 'शांत तकनीक: सिर्फ़ ज़रूरी अलर्ट',
    'family.note.calm.body':
      'शांत तकनीक के सिद्धांत के मुताबिक़, राहुल का फ़ोन तब तक चुप रहता है जब तक माँ मदद न माँगें या उनका अपना नियम कोई बड़ा पेमेंट न रोके। अलर्ट कम हों, तो जो आता है उसे गंभीरता से लिया जाता है।',
    'family.note.dignity.title': 'सम्मान सबसे पहले',
    'family.note.dignity.body':
      'परिवार को सिर्फ़ वही दिखता है जो बुज़ुर्ग ने साझा करना चुना, और वह भी साफ़ शब्दों में। "रोकें" मुख्य बटन है, "मंज़ूरी" पर रकम साफ़ लिखी है, और मंज़ूरी हमेशा वापस ली जा सकती है।',
  },
}
