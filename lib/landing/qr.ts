import type { QrLanding } from "./types";

const QR_RELATED = ["qr-generator", "qr-scanner", "qr-decoder", "qr-validator", "bulk-qr"];

export const QR_LANDINGS: QrLanding[] = [
  {
    kind: "qr", qrType: "wifi", slug: "wifi-qr-code-generator", registryId: "qr-wifi",
    name: "WiFi QR Code Generator",
    title: "WiFi QR Code Generator",
    description: "Create a QR code that joins your WiFi network when scanned. Enter the network name, password and security type, then download PNG, SVG or PDF.",
    intro: "Make a code guests can scan to join your WiFi, instead of reading out a long password. Enter the details exactly as your router shows them.",
    howTo: [
      "Type the network name (SSID) exactly as it appears in your phone's WiFi list, including capital letters and spaces.",
      "Choose the security type (“WPA / WPA2 / WPA3” for almost all modern routers) and enter the password.",
      "Tick “Hidden network” only if your router doesn't broadcast the network name.",
      "Download the code and test it: scan it with a phone that isn't already connected to the network.",
    ],
    sections: [
      {
        heading: "What a WiFi QR code contains",
        paragraphs: [
          "A WiFi QR code is plain text in a standard format that phone cameras understand. The code for a network called Cafe Guest looks like this inside: WIFI:T:WPA;S:Cafe Guest;P:your-password;;. T is the security type, S the network name, P the password and H marks a hidden network.",
          "When a phone scans it, the camera app offers to join the network. Nothing is sent anywhere by the code itself: the phone simply reads the details and connects to the router as if you had typed them.",
        ],
      },
      {
        heading: "Security type: which to choose",
        list: [
          "WPA / WPA2 / WPA3: the option for almost every home and office router. Choose it unless you know otherwise. Inside the code it's written as T:WPA, which phones use for all of these.",
          "WEP: an outdated standard. Only use it for old equipment, and consider upgrading the router's security.",
          "No password (open): for networks without a password, such as some public hotspots with a sign-in page.",
          "A few routers running in WPA3-only mode don't accept phones joining this way. If joining fails, check whether the router offers a WPA2/WPA3 mixed mode.",
        ],
      },
      {
        heading: "Privacy: the password is readable",
        paragraphs: [
          "The password isn't encrypted inside the QR code. Anyone who scans it, or photographs it, can read the password with any QR reader. Treat a printed WiFi code like the password written on a card.",
          "For cafés, rentals and offices, a separate guest network is the safer choice: guests get internet access without reaching your own devices, and you can change its password without affecting anything else. ScanHatch creates the code in your browser, so the password is never sent to our server.",
        ],
      },
      {
        heading: "Printing tips",
        list: [
          "Print it at least 3 cm wide for scanning from arm's length, and larger on a wall across the room.",
          "Add the network name in text next to the code, so people can connect manually if their camera doesn't recognise it.",
          "If you change the WiFi password, the old code stops working. Generate and print a new one.",
        ],
      },
    ],
    faq: [
      { q: "Can a WiFi QR code reveal my password?", a: "Yes. The password is stored as readable text in the code, so anyone who scans it can see it. Use a guest network for codes you display publicly." },
      { q: "Does the QR code expire?", a: "No. It keeps working for as long as the network name and password stay the same. Changing either one means you need a new code." },
      { q: "Which phones can join WiFi from a QR code?", a: "Current iPhones and most Android phones can do this from the built-in camera or QR scanner. Some older phones need a separate QR app." },
      { q: "Can I print a WiFi QR code?", a: "Yes. Download SVG or PDF for sharp printing at any size, or PNG for sharing digitally." },
    ],
    related: [...QR_RELATED],
  },
  {
    kind: "qr", qrType: "url", slug: "url-qr-code-generator", registryId: "qr-url",
    name: "URL QR Code Generator",
    title: "URL QR Code Generator – Link to Any Website",
    description: "Turn a web address into a QR code that opens the page when scanned. Free static QR codes with no expiry, downloadable as PNG, SVG or PDF.",
    intro: "Paste a web address to get a QR code that opens it. The link is stored in the code itself, so it works without any ScanHatch account or redirect.",
    howTo: [
      "Paste the full web address. If you leave out https://, it's added for you.",
      "Check the preview and readability notes: shorter links make simpler codes that scan more easily.",
      "Choose colours or add a logo if you like, keeping strong contrast.",
      "Download the code and scan it with your phone to confirm it opens the right page before printing.",
    ],
    sections: [
      {
        heading: "The link is inside the code",
        paragraphs: [
          "ScanHatch makes static QR codes: the web address itself is encoded in the pattern. The code will open that exact address for as long as the page exists. It doesn't expire and doesn't depend on ScanHatch staying online.",
          "The trade-off is that a static code can't be edited after printing. If the page moves, the code points to the old address. To keep flexibility, link to a page you control and can redirect yourself, such as yourdomain.com/menu, rather than a long address from a third-party service.",
          "Static codes also don't count scans. If you need scan statistics, add campaign parameters (such as ?utm_source=poster) to the link so your own website analytics can see the visits.",
        ],
      },
      {
        heading: "Use https",
        paragraphs: [
          "Encode https:// addresses rather than http:// wherever the site supports it. Browsers warn about unencrypted pages, and people scanning a code in public are rightly cautious about where it leads.",
        ],
      },
      {
        heading: "Shorter links scan better",
        paragraphs: [
          "Every extra character adds modules (squares) to the code. A 30-character link makes a small, open pattern that phones read instantly; a 300-character tracking link makes a dense one that needs to be printed larger. Remove unnecessary parameters, or use a short path on your own domain.",
          "Be careful with public link shorteners for printed codes: if the shortening service closes or changes its terms, every printed code breaks.",
        ],
      },
    ],
    faq: [
      { q: "Do these URL QR codes expire?", a: "No. The address is stored in the code, so it works as long as the web page exists." },
      { q: "Can I change the link after printing?", a: "Not the code itself. You can change what the address shows, for example by redirecting that page on your own website." },
      { q: "Can I track how many people scan it?", a: "ScanHatch doesn't track scans. Adding campaign parameters to the link lets your own website analytics count the visits." },
    ],
    related: [...QR_RELATED],
  },
  {
    kind: "qr", qrType: "email", slug: "email-qr-code-generator", registryId: "qr-email",
    name: "Email QR Code Generator",
    title: "Email QR Code Generator",
    description: "Create a QR code that opens a new email with the address, subject and message already filled in. Download as PNG, SVG or PDF.",
    intro: "Scanning this code opens the phone's email app with a message ready to send. Useful for feedback, support requests and sign-ups.",
    howTo: [
      "Enter the email address that should receive the messages.",
      "Optionally add a subject and a starting message, such as a reference number.",
      "Download the code and test it on a phone with an email app set up.",
    ],
    sections: [
      {
        heading: "How an email QR code works",
        paragraphs: [
          "The code contains a mailto: link, the same kind used by “email us” links on websites, for example mailto:hello@example.com?subject=Order%2042. Scanning it opens the phone's default email app with the fields filled in.",
          "Nothing is sent automatically. The person scanning can read and edit the email and decides whether to send it, from their own address.",
        ],
      },
      {
        heading: "Good uses",
        list: [
          "Product feedback cards with a subject line that identifies the product or batch.",
          "Support stickers on equipment, with the asset number in the subject so requests arrive labelled.",
          "Event or newsletter sign-ups where the subject line tells you what the person is asking for.",
        ],
      },
      {
        heading: "Things to know",
        list: [
          "The person needs an email app set up on their phone. For people who don't, a web form linked with a URL QR code may work better.",
          "Your email address is readable to anyone who scans the code, so expect some spam if it's printed publicly.",
          "Long pre-filled messages make the code denser. Keep the message short; the sender can type the rest.",
        ],
      },
    ],
    faq: [
      { q: "Does scanning the code send an email?", a: "No. It opens a draft. The person scanning chooses whether to send it." },
      { q: "Which email app opens?", a: "Whichever app is set as the default for email on that phone." },
      { q: "Can I add several recipients?", a: "ScanHatch's email type takes one address. For several recipients, use a shared inbox address." },
    ],
    related: [...QR_RELATED],
  },
  {
    kind: "qr", qrType: "phone", slug: "phone-qr-code-generator", registryId: "qr-phone",
    name: "Phone Number QR Code Generator",
    title: "Phone Number QR Code Generator – Call on Scan",
    description: "Create a QR code that starts a phone call to your number. Include the country code so it works anywhere. Download as PNG, SVG or PDF.",
    intro: "Scanning this code opens the phone's dialler with your number filled in, so nobody has to type it.",
    howTo: [
      "Enter the phone number with its international code, for example +44 20 7946 0000.",
      "Download the code.",
      "Scan it to check the number appears correctly in the dialler.",
    ],
    sections: [
      {
        heading: "Always include the country code",
        paragraphs: [
          "The code contains a tel: link, such as tel:+442079460000. Writing the number in international format, starting with + and the country code and without the leading 0 of the local number, means it dials correctly for visitors and for anyone travelling.",
          "Spaces and brackets are removed from the number inside the code; they don't affect dialling.",
        ],
      },
      {
        heading: "What happens when someone scans it",
        paragraphs: [
          "The phone shows the number and asks before calling. It never dials automatically. On tablets and computers that can't make calls, the code may offer to add the number to contacts or do nothing.",
        ],
      },
      {
        heading: "Where it helps",
        list: [
          "Service vans, shop windows and signs where people are on the move.",
          "Printed menus for phone orders, and appointment cards.",
          "For a code that also saves your name and email, use a vCard QR code instead.",
        ],
      },
    ],
    faq: [
      { q: "Does the phone call immediately?", a: "No. The dialler opens with the number filled in, and the person presses call." },
      { q: "Can I use a landline number?", a: "Yes. Any number that can be dialled from a mobile phone works." },
    ],
    related: [...QR_RELATED],
  },
  {
    kind: "qr", qrType: "sms", slug: "sms-qr-code-generator", registryId: "qr-sms",
    name: "SMS QR Code Generator",
    title: "SMS QR Code Generator – Pre-filled Text Messages",
    description: "Create a QR code that opens a text message with the number and message already written. Ideal for text-to-join and keyword campaigns.",
    intro: "Scanning the code opens the messaging app with the recipient and your message filled in. The person just presses send.",
    howTo: [
      "Enter the number that should receive the message, with its country code.",
      "Write the message, for example a keyword such as JOIN or a booking reference.",
      "Download the code, then test it on both an iPhone and an Android phone if you can.",
    ],
    sections: [
      {
        heading: "How it works",
        paragraphs: [
          "The code uses the SMSTO format (SMSTO:+447700900000:JOIN), which the camera apps on iPhone and Android recognise. The message isn't sent automatically: it appears in the messaging app, where it can be edited or cancelled.",
        ],
      },
      {
        heading: "Text-to-join and keyword campaigns",
        paragraphs: [
          "Pre-filled keywords reduce typing errors in SMS campaigns: the exact keyword your system expects is already in the message. Many countries require clear consent and an easy way to opt out (such as replying STOP) for marketing texts. Check the rules that apply to you.",
          "Remember that standard message rates apply to the sender, and that short codes may not be reachable from other countries.",
        ],
      },
      {
        heading: "Keep the message short",
        paragraphs: [
          "A single text holds 160 plain characters; longer messages, or ones with emoji, may be split. Shorter messages also keep the QR code simple and quick to scan.",
        ],
      },
    ],
    faq: [
      { q: "Does the message send by itself?", a: "No. It opens as a draft, and the person decides whether to send it." },
      { q: "Can I use it for iMessage or WhatsApp?", a: "The message opens in the phone's default messaging app. For WhatsApp, use a WhatsApp QR code instead." },
    ],
    related: [...QR_RELATED],
  },
  {
    kind: "qr", qrType: "vcard", slug: "vcard-qr-code-generator", registryId: "qr-vcard",
    name: "vCard QR Code Generator",
    title: "vCard QR Code Generator – Contact Card QR Codes",
    description: "Create a QR code that saves your name, phone, email, company, website and address to a phone's contacts. Great for business cards and badges.",
    intro: "Scanning a vCard code offers to save your details straight into the phone's contacts, with nothing to type.",
    howTo: [
      "Fill in the fields you want to share. Every field is optional, but add at least a name.",
      "Keep the details short: every character makes the code denser.",
      "Download it and scan it to check the contact looks right before printing business cards.",
    ],
    sections: [
      {
        heading: "What's included",
        paragraphs: [
          "ScanHatch writes a vCard 3.0 contact, the format used by phone contact apps and email programs. It can include first and last name, organisation, job title, phone number, email, website and a postal address (street, city, county or state, postcode and country).",
          "Photos and logos inside the contact aren't included: an image would make the QR code far too large to scan. You can still put your logo in the middle of the QR code itself.",
        ],
      },
      {
        heading: "vCard or compact contact?",
        paragraphs: [
          "If the code is going somewhere small, such as a name badge, the compact contact type (MeCard) holds name, phone, email and website in fewer characters, producing a simpler code. It's available in the same generator under “Contact (compact)”. Use vCard when you want the job title, company and address too.",
        ],
      },
      {
        heading: "Compatibility",
        list: [
          "Current iPhone and Android cameras recognise vCard codes and offer to add the contact.",
          "How fields appear can vary slightly between contact apps, so test with the phones your audience is likely to use.",
          "The details are fixed in the code. If your number or job changes, print a new code.",
        ],
      },
      {
        heading: "Business card tips",
        list: [
          "Print the code at least 2 cm wide on a business card, with a white margin around it.",
          "A vCard with all fields filled is dense. If it looks busy, remove the address or use the compact type.",
        ],
      },
    ],
    faq: [
      { q: "Will it save my photo?", a: "No. Contact photos are too large for a QR code. Only text details are included." },
      { q: "Can people see my details without saving them?", a: "Yes. Anyone who scans the code can read the details, so only include what you're happy to share." },
      { q: "Can I update the contact later?", a: "Not in a printed code. The details are stored in the code, so changes need a new code." },
    ],
    related: [...QR_RELATED],
  },
  {
    kind: "qr", qrType: "whatsapp", slug: "whatsapp-qr-code-generator", registryId: "qr-whatsapp",
    name: "WhatsApp QR Code Generator",
    title: "WhatsApp QR Code Generator – Start a Chat",
    description: "Create a QR code that opens a WhatsApp chat with your number, optionally with a starter message. Uses WhatsApp's official wa.me links.",
    intro: "Customers scan the code and a WhatsApp chat with you opens, without them saving your number first.",
    howTo: [
      "Enter your WhatsApp number in full international format, starting with the country code.",
      "Optionally add a starter message, such as “Hi, I'd like to book a table”.",
      "Download the code and scan it from a different phone to check the chat opens with the right number.",
    ],
    sections: [
      {
        heading: "How it works",
        paragraphs: [
          "The code contains WhatsApp's click-to-chat link, for example https://wa.me/447700900000?text=Hi. WhatsApp's format needs the number with its country code and without +, spaces or the local leading zero. Enter it in international format and ScanHatch removes the + and spaces for you.",
          "On a phone with WhatsApp installed, the chat opens directly in the app. Without WhatsApp, the link opens WhatsApp's website, which offers to install the app or use WhatsApp Web.",
        ],
      },
      {
        heading: "Before you print",
        list: [
          "The number must have an active WhatsApp account, or the chat won't open.",
          "Your number is visible to anyone who scans the code.",
          "The starter message can be edited by the person before sending, so don't rely on it for exact codes or references.",
          "WhatsApp Business users can get a similar code from the WhatsApp Business app; this one works for personal and business numbers alike.",
        ],
      },
    ],
    faq: [
      { q: "Does the person need to save my number first?", a: "No. The click-to-chat link opens a chat without adding you to their contacts." },
      { q: "Is this an official WhatsApp tool?", a: "No. ScanHatch isn't affiliated with WhatsApp. The code uses WhatsApp's publicly documented wa.me link format." },
    ],
    related: [...QR_RELATED],
  },
  {
    kind: "qr", qrType: "maps", slug: "google-maps-qr-code-generator", registryId: "qr-maps",
    name: "Google Maps QR Code Generator",
    title: "Google Maps QR Code Generator – Share a Location",
    description: "Create a QR code that opens a place or exact coordinates in Google Maps, ready for directions. Useful for venues, events and deliveries.",
    intro: "Scanning the code opens the location in Google Maps, so people can get directions without typing an address.",
    howTo: [
      "Choose whether to find the place by name or address, or by coordinates.",
      "For coordinates, enter latitude and longitude in decimal form, such as 51.5055, -0.0754.",
      "Download the code and scan it to check the pin lands in the right place.",
    ],
    sections: [
      {
        heading: "Place name or coordinates?",
        paragraphs: [
          "A place or address search is easy to read and lets Google Maps show the business listing, opening hours and photos. But names can be ambiguous: “Station Road” exists in hundreds of towns. Include the town and postcode in the search.",
          "Coordinates always point to one exact spot, which is better for entrances, car parks, event fields and places without an address. You can copy coordinates from Google Maps by right-clicking (or long-pressing) a point on the map.",
        ],
      },
      {
        heading: "How it opens",
        paragraphs: [
          "The code contains a Google Maps link (https://www.google.com/maps/search/?api=1&query=…). It opens in the Google Maps app if it's installed, or in the browser otherwise. iPhone users without Google Maps see the location in the browser version.",
        ],
      },
      {
        heading: "Good uses",
        list: [
          "Wedding and event invitations, especially for venues that are hard to find.",
          "Delivery and collection points, such as a loading bay rather than the front door.",
          "Hiking trailheads and meeting points that have no street address.",
        ],
      },
    ],
    faq: [
      { q: "Does the location update if my business moves?", a: "No. The place or coordinates are fixed in the code, so you'd need a new one." },
      { q: "Will it work with Apple Maps?", a: "The code opens Google Maps (app or website). On iPhones without the Google Maps app, it opens in the browser." },
    ],
    related: [...QR_RELATED],
  },
];
