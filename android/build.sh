#!/bin/sh
# Builds the Play bundle and an installable APK of สวนคำ from ../docs:
#   dist/suankham-<version>.aab   upload this to Play Console
#   dist/suankham-<version>.apk   installs straight onto a phone (adb install, or open the file)
# Toolchain: aapt2, javac, d8 from the Android SDK, bundletool (tools/), jarsigner. No Gradle.
# Run python3 tools/build.py first. Bump version.json "code" for every upload.
# The upload key (suankham-upload.keystore + signing.txt) signs every update to the same listing.
set -e
cd "$(dirname "$0")"
SDK=${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}
BT=$SDK/build-tools/36.0.0
JAR=$SDK/platforms/android-36/android.jar
BUNDLETOOL="java -jar tools/bundletool-all-1.18.3.jar"
VC=$(python3 -c "import json;print(json.load(open('version.json'))['code'])")
VN=$(python3 -c "import json;print(json.load(open('version.json'))['name'])")
KS=suankham-upload.keystore; ALIAS=upload
if [ ! -f "$KS" ]; then
  PW=$(python3 -c "import secrets;print(secrets.token_urlsafe(18))")
  keytool -genkeypair -keystore "$KS" -storepass "$PW" -keypass "$PW" -alias "$ALIAS" -keyalg RSA -keysize 4096 \
    -validity 10000 -dname "CN=Suan Kham, O=NaNoBotCo" >/dev/null 2>&1
  printf 'keystore: %s\nalias: %s\npassword: %s\n' "$KS" "$ALIAS" "$PW" > signing.txt
  chmod 600 signing.txt "$KS"
  echo "new upload key: $KS (password in signing.txt). Back both up off this laptop."
fi
PW=$(sed -n 's/^password: //p' signing.txt)
rm -rf build && mkdir -p build/classes build/dex build/assets/www build/base dist
rsync -a --exclude robots.txt --exclude sitemap.xml ../docs/ build/assets/www/
"$BT/aapt2" compile --dir res -o build/res.zip
"$BT/aapt2" link --proto-format -I "$JAR" --manifest AndroidManifest.xml -o build/proto.zip build/res.zip -A build/assets \
  --min-sdk-version 24 --target-sdk-version 36 --version-code "$VC" --version-name "$VN"
javac -nowarn -source 11 -target 11 -encoding UTF-8 -classpath "$JAR" -d build/classes $(find src -name '*.java') 2>&1 | grep -v 'bootstrap class path' || true
"$BT/d8" --min-api 24 --lib "$JAR" --output build/dex $(find build/classes -name '*.class')
(cd build/base && unzip -q ../proto.zip && mkdir manifest dex && mv AndroidManifest.xml manifest/ && cp ../dex/classes.dex dex/ && zip -qr ../base.zip .)
AAB=dist/suankham-$VN.aab; APK=dist/suankham-$VN.apk
rm -f "$AAB" && $BUNDLETOOL build-bundle --modules=build/base.zip --output="$AAB"
jarsigner -keystore "$KS" -storepass "$PW" -sigalg SHA256withRSA -digestalg SHA-256 "$AAB" "$ALIAS" >/dev/null
jarsigner -verify "$AAB" | head -1
$BUNDLETOOL validate --bundle="$AAB" >/dev/null && echo "bundle valid"
$BUNDLETOOL build-apks --bundle="$AAB" --output=build/universal.apks --mode=universal --overwrite \
  --ks="$KS" --ks-pass="pass:$PW" --ks-key-alias="$ALIAS" --key-pass="pass:$PW"
(cd build && unzip -q -o universal.apks universal.apk) && cp build/universal.apk "$APK"
"$BT/apksigner" verify "$APK" && ls -l dist/
