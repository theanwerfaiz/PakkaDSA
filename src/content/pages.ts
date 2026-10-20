/* Text for the plain pages (about, privacy, contribute). Hindi is unreviewed, like the dictionaries. */
import type { Lang } from './catalog';

export interface ProsePage {
  title: string;
  description: string;
  sections: { heading?: string; paragraphs: string[] }[];
}

export const PAGES: Record<'about' | 'privacy' | 'contribute', Record<Lang, ProsePage>> = {
  about: {
    en: {
      title: 'About PakkaDSA',
      description:
        'PakkaDSA is a free, open-source algorithm visualizer for students, with Hindi explanations.',
      sections: [
        {
          paragraphs: [
            'PakkaDSA shows 38 data-structure and algorithm problems running one step at a time. Each step comes with a plain-language note in English or Hindi, the matching line highlighted in pseudocode, Python, Java, C++ and JavaScript, and a picture of the data that moves as the algorithm works.',
            'It is made for students preparing for placements and exams, for teachers who want a clear picture to project in class, and for anyone learning on a phone. Change the input, predict the next step, and mark algorithms as learned as you go.',
            'PakkaDSA is free and open source under the MIT licence. There is no signup, no paywall and no tracking, and it works offline after your first visit.',
          ],
        },
        {
          heading: 'Other good visualizers',
          paragraphs: [
            'Other visualizers exist and are worth a look, such as VisuAlgo and Algorithm Visualizer. PakkaDSA focuses on Hindi step explanations, an interview-pattern learning path, real code in four languages with line highlighting, and a predict-the-next-step quiz.',
          ],
        },
      ],
    },
    hi: {
      title: 'PakkaDSA के बारे में',
      description:
        'PakkaDSA छात्रों के लिए एक मुफ़्त, ओपन-सोर्स एल्गोरिदम विज़ुअलाइज़र है, हिन्दी समझाइश के साथ।',
      sections: [
        {
          paragraphs: [
            'PakkaDSA डेटा स्ट्रक्चर और एल्गोरिदम के 38 सवालों को एक-एक कदम में चलते हुए दिखाता है। हर कदम के साथ अंग्रेज़ी या हिन्दी में आसान नोट, pseudocode, Python, Java, C++ और JavaScript में मिलती हुई लाइन हाइलाइट, और डेटा की तस्वीर मिलती है जो एल्गोरिदम के साथ हिलती है।',
            'यह प्लेसमेंट और परीक्षा की तैयारी करने वाले छात्रों, क्लास में साफ़ तस्वीर दिखाना चाहने वाले शिक्षकों, और फ़ोन पर सीखने वाले हर व्यक्ति के लिए बना है। इनपुट बदलें, अगला कदम बताइए, और सीखे हुए एल्गोरिदम मार्क करते चलें।',
            'PakkaDSA MIT लाइसेंस के तहत मुफ़्त और ओपन सोर्स है। न साइन-अप, न पेवॉल, न ट्रैकिंग, और पहली बार खोलने के बाद यह ऑफ़लाइन भी चलता है।',
          ],
        },
        {
          heading: 'दूसरे अच्छे विज़ुअलाइज़र',
          paragraphs: [
            'दूसरे विज़ुअलाइज़र भी हैं और देखने लायक हैं, जैसे VisuAlgo और Algorithm Visualizer। PakkaDSA का ध्यान हिन्दी में कदम-दर-कदम समझाइश, इंटरव्यू पैटर्न वाले सीखने के रास्ते, चार भाषाओं में लाइन हाइलाइट वाले असली कोड, और अगला कदम बताने वाली क्विज़ पर है।',
          ],
        },
      ],
    },
  },
  privacy: {
    en: {
      title: 'Privacy',
      description:
        'PakkaDSA collects nothing. No accounts, no cookies, no analytics, no third-party requests.',
      sections: [
        {
          paragraphs: [
            'PakkaDSA collects nothing about you. There are no accounts, no cookies, no analytics, no ads and no fingerprinting. The site is plain static files, and every font, script and image is served from this site; your browser makes no requests to anyone else.',
            'Your settings stay on your device. The browser stores your language, theme, playback speed, animation setting, code language, which algorithms you marked as learned, and your last position, in local storage under keys starting with "pakkadsa:". You can clear them at any time through your browser settings. The site works even if storage is blocked.',
            'The inputs you type run only in your browser. A share link puts the algorithm, step and input in the part of the address after "#", which browsers never send to the server.',
            'Narration uses your browser’s built-in speech voices. "Save image" creates the picture on your device and saves it as an ordinary download.',
          ],
        },
      ],
    },
    hi: {
      title: 'प्राइवेसी',
      description:
        'PakkaDSA कुछ भी इकट्ठा नहीं करता। न अकाउंट, न कुकी, न एनालिटिक्स, न किसी और साइट से अनुरोध।',
      sections: [
        {
          paragraphs: [
            'PakkaDSA आपके बारे में कुछ भी इकट्ठा नहीं करता। न अकाउंट, न कुकी, न एनालिटिक्स, न विज्ञापन, न फ़िंगरप्रिंटिंग। साइट सिर्फ़ स्टैटिक फ़ाइलें है, और हर फ़ॉन्ट, स्क्रिप्ट और इमेज इसी साइट से आती है; आपका ब्राउज़र किसी और को अनुरोध नहीं भेजता।',
            'आपकी सेटिंग आपके डिवाइस पर ही रहती हैं। ब्राउज़र आपकी भाषा, थीम, प्लेबैक गति, एनिमेशन सेटिंग, कोड की भाषा, सीखे हुए एल्गोरिदम और आखिरी जगह को "pakkadsa:" से शुरू होने वाली keys में local storage में रखता है। आप इन्हें कभी भी ब्राउज़र सेटिंग से मिटा सकते हैं। storage बंद हो तब भी साइट चलती है।',
            'आप जो इनपुट लिखते हैं वह सिर्फ़ आपके ब्राउज़र में चलता है। शेयर लिंक एल्गोरिदम, कदम और इनपुट को पते के "#" के बाद वाले हिस्से में रखता है, जिसे ब्राउज़र कभी सर्वर को नहीं भेजते।',
            'बोलकर सुनाने के लिए आपके ब्राउज़र की अपनी आवाज़ें इस्तेमाल होती हैं। "इमेज सेव करें" तस्वीर आपके डिवाइस पर ही बनाता है और सामान्य डाउनलोड की तरह सेव करता है।',
          ],
        },
      ],
    },
  },
  contribute: {
    en: {
      title: 'Contribute',
      description:
        'Add an algorithm, a code language or a translation to PakkaDSA. Every change is small and tested.',
      sections: [
        {
          paragraphs: [
            'PakkaDSA is open source, and contributions are welcome: new algorithms, new code languages, translations, accessibility fixes and bug reports.',
          ],
        },
        {
          heading: 'Add an algorithm',
          paragraphs: [
            'An algorithm is one generator file that records each step with an English and a Hindi message, one content entry (description, interview tip, pseudocode and complexity), four tagged code snippets that run in the test harnesses, and tests. The contributing guide in the repository walks through every step.',
          ],
        },
        {
          heading: 'Add a code language or a translation',
          paragraphs: [
            'A new code language is 38 tagged snippets plus a test harness that runs them. A translation is a new dictionary file plus the step messages. Native-speaker review of the Hindi text is especially welcome.',
          ],
        },
      ],
    },
    hi: {
      title: 'योगदान दें',
      description:
        'PakkaDSA में कोई एल्गोरिदम, कोड की भाषा या अनुवाद जोड़ें। हर बदलाव छोटा और टेस्ट किया हुआ होता है।',
      sections: [
        {
          paragraphs: [
            'PakkaDSA ओपन सोर्स है, और योगदान का स्वागत है: नए एल्गोरिदम, नई कोड भाषाएँ, अनुवाद, एक्सेसिबिलिटी सुधार और बग रिपोर्ट।',
          ],
        },
        {
          heading: 'एल्गोरिदम जोड़ें',
          paragraphs: [
            'एक एल्गोरिदम में होता है: एक generator फ़ाइल जो हर कदम को अंग्रेज़ी और हिन्दी संदेश के साथ दर्ज करती है, एक content entry (विवरण, इंटरव्यू टिप, pseudocode और जटिलता), चार tagged कोड snippets जो टेस्ट हार्नेस में चलते हैं, और टेस्ट। रिपॉज़िटरी की contributing गाइड हर कदम बताती है।',
          ],
        },
        {
          heading: 'कोड की भाषा या अनुवाद जोड़ें',
          paragraphs: [
            'नई कोड भाषा का मतलब है 38 tagged snippets और उन्हें चलाने वाला टेस्ट हार्नेस। अनुवाद का मतलब है नई dictionary फ़ाइल और कदमों के संदेश। हिन्दी टेक्स्ट की मूल वक्ता द्वारा समीक्षा का खास स्वागत है।',
          ],
        },
      ],
    },
  },
};
