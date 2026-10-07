สวนคำ for Android — package co.nanobot.suankham (permanent once uploaded)

Build: python3 tools/build.py, then android/build.sh. Out: android/dist/suankham-<version>.aab (upload to Play) and .apk (install on a phone). Raise "code" in android/version.json before every new upload; Play refuses a repeated code.

The app is a WebView around the site in docs/, carried inside the app and served from https://appassets.androidplatform.net/ so it opens without a connection. Typefaces come from Google Fonts when online. ฟัง uses the phone's own Thai text-to-speech through window.SKAndroid.

Upload key: android/suankham-upload.keystore with its password in android/signing.txt. Both stay off GitHub (.gitignore). Every update to the listing must be signed with this key, so keep a copy somewhere other than this laptop. Turn on Play App Signing at the first upload; Google then holds the app signing key and this file stays the upload key, which Google can reset if it is ever lost.

Play Console, personal account:
1. Create app: name สวนคำ · The Word Garden, default language English (United States), App, Paid.
2. Store listing, Data safety, content rating, target audience: android/store/listing.txt and data-safety.txt have the text and answers; graphics are in android/store/.
3. Privacy policy URL: https://nanobotco.github.io/suan-kham/privacy.html
4. Testing → Closed testing: upload the .aab, add at least 12 testers by email list, and keep them opted in for 14 days in a row. A new personal account can apply for production only after that.
5. Production: set the price, then roll out.

bundletool (android/tools/bundletool-all-1.18.3.jar, Google's, sha256 a099cfa1…028e29) is not in git; re-download from github.com/google/bundletool/releases if the folder is missing.
