import type { FeatureStrings } from '../../i18n/types'

export const strings: FeatureStrings = {
  en: {
    'accessibility.title': 'Accessibility label',
    'accessibility.lead':
      'What Ruko does so that everyone can use it, in plain words. Inspired by the accessibility labels on app stores.',
    'accessibility.lead.easy': 'How Ruko works for everyone.',

    'accessibility.label.heading': 'Accessibility',
    'accessibility.label.sub': 'Supported in Ruko',
    'accessibility.label.target': 'Aims for WCAG 2.2 Level AA',
    'accessibility.label.listName': 'Supported features',

    'accessibility.f.screenReader': 'Screen reader labels',
    'accessibility.f.screenReader.desc':
      'Every button, switch and picture has a spoken name for TalkBack and VoiceOver.',
    'accessibility.f.largerText': 'Larger text, up to 200%',
    'accessibility.f.largerText.desc': 'The whole app grows and rearranges itself, so nothing is cut off.',
    'accessibility.f.contrast': 'Sufficient contrast',
    'accessibility.f.contrast.desc': 'Text is at least 4.5 to 1 against its background. See the measured table below.',
    'accessibility.f.highContrast': 'High contrast mode',
    'accessibility.f.highContrast.desc': 'Black on white, thicker borders and underlined links.',
    'accessibility.f.motion': 'Reduced motion',
    'accessibility.f.motion.desc': 'Follows your phone, or turn movement off in Ruko.',
    'accessibility.f.languages': 'Hindi and English',
    'accessibility.f.languages.desc': 'Every word in both languages. Change it any time from Help.',
    'accessibility.f.easyRead': 'Easy Read',
    'accessibility.f.easyRead.desc': 'Shorter sentences, one idea at a time, more space.',
    'accessibility.f.readAloud': 'Read aloud',
    'accessibility.f.readAloud.desc': 'Important screens can be read aloud. The same words stay on screen.',
    'accessibility.f.offline': 'Works offline',
    'accessibility.f.offline.desc': 'The calm card and the 1930 helpline button work without internet.',
    'accessibility.f.noTimeLimits': 'No time limits on you',
    'accessibility.f.noTimeLimits.desc': 'No step closes or moves on by itself while you read or decide.',
    'accessibility.f.targets': 'Big buttons',
    'accessibility.f.targets.desc': 'Every button is at least 48 pixels, easy to press with any thumb.',
    'accessibility.f.keyboard': 'Keyboard support',
    'accessibility.f.keyboard.desc': 'Everything works with a keyboard, with a thick, clear focus ring.',
    'accessibility.f.help': 'Help in the same place',
    'accessibility.f.help.desc': 'The same Help button sits at the top right of every screen.',

    'accessibility.adaptCta': 'Adapt Ruko to me',

    'accessibility.contrast.heading': 'Measured contrast',
    'accessibility.contrast.intro':
      'Ruko measures its own colours right now, on this screen, with the WCAG formula. Text needs at least 4.5 to 1. Borders and focus rings need at least 3 to 1.',
    'accessibility.contrast.intro.easy': 'Ruko checks its own colours now. A bigger number is easier to read.',
    'accessibility.contrast.caption': 'Colour pairs in {mode} mode',
    'accessibility.contrast.mode.standard': 'standard',
    'accessibility.contrast.mode.high': 'high contrast',
    'accessibility.contrast.summary': '{passed} of {total} pairs meet WCAG AA.',
    'accessibility.contrast.col.pair': 'Colour pair',
    'accessibility.contrast.col.ratio': 'Ratio',
    'accessibility.contrast.col.level': 'Result',
    'accessibility.contrast.ratio': '{ratio} : 1',
    'accessibility.contrast.needs': 'Needs {min} : 1',
    'accessibility.contrast.sample': 'Aa',
    'accessibility.contrast.source.live':
      'Measured live from the colours on this screen. Ratios are rounded down, never up.',
    'accessibility.contrast.source.file':
      'Calculated from Ruko’s colour token values, because this browser could not report live colours. Ratios are rounded down, never up.',
    'accessibility.contrast.try.label': 'High contrast',
    'accessibility.contrast.try.desc': 'Turn it on and the table measures again straight away.',

    'accessibility.pair.body': 'Body text',
    'accessibility.pair.muted': 'Quieter text on cards',
    'accessibility.pair.primary': 'Main button',
    'accessibility.pair.danger': 'Danger button',
    'accessibility.pair.success': 'Success message',
    'accessibility.pair.link': 'Links',
    'accessibility.pair.soft': 'Text on soft teal',
    'accessibility.pair.caution': 'Caution text',
    'accessibility.pair.highlight': 'Highlighted text',
    'accessibility.pair.border': 'Control borders',
    'accessibility.pair.focus': 'Focus ring',

    'accessibility.level.aaa': 'Passes AAA',
    'accessibility.level.aa': 'Passes AA',
    'accessibility.level.aaLarge': 'Large text only',
    'accessibility.level.fail': 'Below AA',

    'accessibility.test.heading': 'How we test',
    'accessibility.test.intro':
      'Some checks run automatically every time the code changes. Others are a checklist the team works through by hand before each release.',
    'accessibility.test.intro.easy': 'Some checks are automatic. Some we do by hand.',
    'accessibility.test.auto.heading': 'Automatic, on every change',
    'accessibility.test.auto.axeUnit': 'axe accessibility checks on every screen, in component tests.',
    'accessibility.test.auto.axeE2e':
      'axe checks again in a real browser on a 360-pixel phone screen, in end-to-end tests, in both languages and both contrast modes.',
    'accessibility.test.auto.tokens':
      'A contrast test on every colour token pair, using the same formula as the table above.',
    'accessibility.test.auto.i18n': 'A translation test: every English sentence has a Hindi version.',
    'accessibility.test.auto.lint': 'Accessibility lint rules that flag missing labels while we write code.',
    'accessibility.test.manual.heading': 'By hand, before each release',
    'accessibility.test.manual.keyboard': 'Keyboard only: walk the whole scam-call flow without a mouse or touch.',
    'accessibility.test.manual.screenReader':
      'TalkBack and VoiceOver: every control has a sensible name, in Hindi and English.',
    'accessibility.test.manual.zoom': 'Text at 200% and browser zoom at 400%: nothing cut off, no sideways scrolling.',
    'accessibility.test.manual.modes': 'High contrast, reduced motion and Easy Read on every screen.',
    'accessibility.test.manual.people': 'Usability sessions with older adults and their grown-up children.',
    'accessibility.test.honest':
      'These are the checks we run, not a claim of results. An automated test cannot tell whether Ruko feels calm and easy. Only real people can.',
    'accessibility.test.honest.easy': 'Tests help. Only real people can tell us if Ruko feels easy.',
    'accessibility.test.honestTitle': 'Checks, not promises',
    'accessibility.more.about': 'How Ruko was designed',

    'accessibility.note.label.title': 'A label you can read before you rely on it',
    'accessibility.note.label.body':
      'Inspired by Apple’s App Store Accessibility Nutrition Labels: say plainly which features exist, so a family can judge Ruko before they install it.',
    'accessibility.note.live.title': 'Numbers that cannot drift',
    'accessibility.note.live.body':
      'The contrast table is computed at runtime from the same colour tokens the app uses. If a colour changes, the label changes with it.',
  },
  hi: {
    'accessibility.title': 'सुलभता लेबल',
    'accessibility.lead':
      'रुको हर किसी के लिए आसान रहे, इसके लिए वह क्या-क्या करता है, सीधे शब्दों में। ऐप स्टोर के सुलभता लेबल से प्रेरित।',
    'accessibility.lead.easy': 'रुको हर किसी के लिए कैसे काम करता है।',

    'accessibility.label.heading': 'सुलभता',
    'accessibility.label.sub': 'रुको में मौजूद सुविधाएँ',
    'accessibility.label.target': 'लक्ष्य: WCAG 2.2 लेवल AA',
    'accessibility.label.listName': 'मौजूद सुविधाएँ',

    'accessibility.f.screenReader': 'स्क्रीन रीडर के लिए नाम',
    'accessibility.f.screenReader.desc':
      'हर बटन, स्विच और तस्वीर का बोला जाने वाला नाम है, TalkBack और VoiceOver के लिए।',
    'accessibility.f.largerText': 'बड़े अक्षर, 200% तक',
    'accessibility.f.largerText.desc': 'पूरा ऐप बड़ा होकर ख़ुद को ठीक से सजा लेता है, कुछ भी कटता नहीं।',
    'accessibility.f.contrast': 'साफ़ दिखने वाले रंग',
    'accessibility.f.contrast.desc':
      'अक्षर अपने पीछे के रंग से कम से कम 4.5 गुना अलग दिखते हैं। नीचे नापी गई तालिका देखें।',
    'accessibility.f.highContrast': 'ज़्यादा कंट्रास्ट',
    'accessibility.f.highContrast.desc': 'सफ़ेद पर काला, मोटे किनारे और लिंक के नीचे लाइन।',
    'accessibility.f.motion': 'कम हलचल',
    'accessibility.f.motion.desc': 'आपके फ़ोन की सेटिंग मानता है, या आप रुको में हलचल बंद कर सकते हैं।',
    'accessibility.f.languages': 'हिंदी और अंग्रेज़ी',
    'accessibility.f.languages.desc': 'हर शब्द दोनों भाषाओं में। “मदद” से कभी भी बदलें।',
    'accessibility.f.easyRead': 'आसान भाषा',
    'accessibility.f.easyRead.desc': 'छोटे वाक्य, एक बार में एक बात, ज़्यादा जगह।',
    'accessibility.f.readAloud': 'पढ़कर सुनाना',
    'accessibility.f.readAloud.desc': 'ज़रूरी स्क्रीन पढ़कर सुनाई जा सकती हैं। वही शब्द स्क्रीन पर भी रहते हैं।',
    'accessibility.f.offline': 'बिना इंटरनेट भी चलता है',
    'accessibility.f.offline.desc': 'शांत कार्ड और 1930 हेल्पलाइन का बटन बिना इंटरनेट के भी काम करते हैं।',
    'accessibility.f.noTimeLimits': 'आप पर कोई समय-सीमा नहीं',
    'accessibility.f.noTimeLimits.desc':
      'जब तक आप पढ़ रहे हैं या सोच रहे हैं, कोई स्क्रीन अपने-आप बंद नहीं होती, आगे नहीं बढ़ती।',
    'accessibility.f.targets': 'बड़े बटन',
    'accessibility.f.targets.desc': 'हर बटन कम से कम 48 पिक्सेल का है, किसी भी अँगूठे से आसानी से दबता है।',
    'accessibility.f.keyboard': 'कीबोर्ड से भी चलता है',
    'accessibility.f.keyboard.desc':
      'सब कुछ कीबोर्ड से चलता है, और चुनी हुई चीज़ के चारों ओर मोटा, साफ़ घेरा दिखता है।',
    'accessibility.f.help': 'मदद हमेशा एक ही जगह',
    'accessibility.f.help.desc': 'हर स्क्रीन पर ऊपर दाईं ओर वही “मदद” बटन है।',

    'accessibility.adaptCta': 'रुको को मेरे हिसाब से बदलें',

    'accessibility.contrast.heading': 'नापा गया कंट्रास्ट',
    'accessibility.contrast.intro':
      'रुको अभी, इसी स्क्रीन पर, WCAG के फ़ॉर्मूले से अपने रंग ख़ुद नापता है। अक्षरों के लिए कम से कम 4.5 : 1 चाहिए। किनारों और फ़ोकस घेरे के लिए कम से कम 3 : 1।',
    'accessibility.contrast.intro.easy': 'रुको अभी अपने रंग जाँचता है। बड़ी संख्या मतलब पढ़ने में आसान।',
    'accessibility.contrast.caption': '{mode} मोड में रंगों की जोड़ियाँ',
    'accessibility.contrast.mode.standard': 'सामान्य',
    'accessibility.contrast.mode.high': 'ज़्यादा कंट्रास्ट',
    'accessibility.contrast.summary': '{total} में से {passed} जोड़ियाँ WCAG AA पर खरी हैं।',
    'accessibility.contrast.col.pair': 'रंगों की जोड़ी',
    'accessibility.contrast.col.ratio': 'अनुपात',
    'accessibility.contrast.col.level': 'नतीजा',
    'accessibility.contrast.ratio': '{ratio} : 1',
    'accessibility.contrast.needs': 'चाहिए {min} : 1',
    'accessibility.contrast.sample': 'अआ',
    'accessibility.contrast.source.live':
      'इसी स्क्रीन के रंगों से अभी नापा गया। अनुपात हमेशा नीचे की ओर गोल किए गए हैं, ऊपर नहीं।',
    'accessibility.contrast.source.file':
      'यह ब्राउज़र अभी के रंग नहीं बता सका, इसलिए रुको की रंग-फ़ाइल के मानों से गिना गया। अनुपात हमेशा नीचे की ओर गोल किए गए हैं।',
    'accessibility.contrast.try.label': 'ज़्यादा कंट्रास्ट',
    'accessibility.contrast.try.desc': 'इसे चालू करें, तालिका तुरंत दोबारा नापेगी।',

    'accessibility.pair.body': 'मुख्य अक्षर',
    'accessibility.pair.muted': 'कार्ड पर हल्के अक्षर',
    'accessibility.pair.primary': 'मुख्य बटन',
    'accessibility.pair.danger': 'ख़तरे वाला बटन',
    'accessibility.pair.success': 'सफलता का संदेश',
    'accessibility.pair.link': 'लिंक',
    'accessibility.pair.soft': 'हल्के हरे-नीले पर अक्षर',
    'accessibility.pair.caution': 'सावधानी वाले अक्षर',
    'accessibility.pair.highlight': 'हाइलाइट किए अक्षर',
    'accessibility.pair.border': 'बटन और बॉक्स के किनारे',
    'accessibility.pair.focus': 'फ़ोकस का घेरा',

    'accessibility.level.aaa': 'AAA पास',
    'accessibility.level.aa': 'AA पास',
    'accessibility.level.aaLarge': 'सिर्फ़ बड़े अक्षरों के लिए',
    'accessibility.level.fail': 'AA से कम',

    'accessibility.test.heading': 'हम कैसे जाँचते हैं',
    'accessibility.test.intro':
      'कुछ जाँचें हर बार कोड बदलने पर अपने-आप चलती हैं। बाक़ी एक सूची है, जिसे टीम हर रिलीज़ से पहले हाथ से पूरा करती है।',
    'accessibility.test.intro.easy': 'कुछ जाँचें अपने-आप होती हैं। कुछ हम हाथ से करते हैं।',
    'accessibility.test.auto.heading': 'अपने-आप, हर बदलाव पर',
    'accessibility.test.auto.axeUnit': 'कंपोनेंट टेस्ट में हर स्क्रीन पर axe से सुलभता की जाँच।',
    'accessibility.test.auto.axeE2e':
      'एंड-टू-एंड टेस्ट में असली ब्राउज़र में, 360 पिक्सेल की फ़ोन स्क्रीन पर, दोनों भाषाओं और दोनों कंट्रास्ट मोड में फिर से axe जाँच।',
    'accessibility.test.auto.tokens': 'हर रंग-जोड़ी की कंट्रास्ट जाँच, ऊपर की तालिका वाले फ़ॉर्मूले से ही।',
    'accessibility.test.auto.i18n': 'अनुवाद की जाँच: हर अंग्रेज़ी वाक्य का हिंदी रूप मौजूद है।',
    'accessibility.test.auto.lint': 'सुलभता के नियम, जो कोड लिखते समय ही छूटे हुए नाम पकड़ लेते हैं।',
    'accessibility.test.manual.heading': 'हाथ से, हर रिलीज़ से पहले',
    'accessibility.test.manual.keyboard':
      'सिर्फ़ कीबोर्ड से: ठगी वाली कॉल का पूरा रास्ता बिना माउस या टच के पूरा करना।',
    'accessibility.test.manual.screenReader':
      'TalkBack और VoiceOver: हर बटन का नाम ठीक से बोला जाए, हिंदी और अंग्रेज़ी में।',
    'accessibility.test.manual.zoom': '200% अक्षर और 400% ब्राउज़र ज़ूम: कुछ कटे नहीं, दाएँ-बाएँ स्क्रॉल न करना पड़े।',
    'accessibility.test.manual.modes': 'हर स्क्रीन पर ज़्यादा कंट्रास्ट, कम हलचल और आसान भाषा।',
    'accessibility.test.manual.people': 'बुज़ुर्गों और उनके बड़े बच्चों के साथ इस्तेमाल करके देखने के सत्र।',
    'accessibility.test.honest':
      'ये वे जाँचें हैं जो हम करते हैं, नतीजों का दावा नहीं। कोई अपने-आप चलने वाला टेस्ट यह नहीं बता सकता कि रुको शांत और आसान लगता है या नहीं। यह सिर्फ़ असली लोग बता सकते हैं।',
    'accessibility.test.honest.easy': 'टेस्ट मदद करते हैं। पर रुको आसान है या नहीं, यह असली लोग ही बताते हैं।',
    'accessibility.test.honestTitle': 'जाँच, वादे नहीं',
    'accessibility.more.about': 'रुको कैसे डिज़ाइन किया गया',

    'accessibility.note.label.title': 'भरोसा करने से पहले पढ़ सकें, ऐसा लेबल',
    'accessibility.note.label.body':
      'Apple के App Store के सुलभता लेबल से प्रेरित: साफ़ बताइए कि कौन-सी सुविधाएँ हैं, ताकि परिवार ऐप डालने से पहले ही रुको को परख सके।',
    'accessibility.note.live.title': 'ऐसे आँकड़े जो पुराने नहीं पड़ते',
    'accessibility.note.live.body':
      'कंट्रास्ट तालिका ऐप चलते समय उन्हीं रंगों से गिनी जाती है जो ऐप इस्तेमाल करता है। रंग बदले, तो लेबल भी साथ बदल जाता है।',
  },
}
