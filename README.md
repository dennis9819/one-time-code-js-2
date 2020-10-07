# one-time-code.js
Dies ist ein Programm zum erzeugen von anonymen Schlüsseln. Diese werden automatisch den Teilnehmern zugesendet.
Zudem wird ein asymetrisch verschlüsselter Safe erstellt.

## Zweck
Für ananoyme Wahlen muss sichergestellt werden, dass:
1. Nur berechtigter Personen abstimmen können
2. Jeder Wähler nicht rückverfolgbar ist
3. Jeder Wähler nur einmal abstimmen kann

Punkte 1. und 2. Lassen sich mit dieser Anwendug realisieren.

## Funktionsprinzip
Diese Anwendung muss auf zwei Systemen installiert sein. Beide Systeme dürfen nicht aufeinander Zugreifen können und müssen von verschiedenen Personen bedient werden.
Die beiden Systeme sind:
- System A & Person A: Hier werden die Schlüssel erzeugt, benutzern zufällig zugewiesen und versendet. 
- System B & Person B: Hier wird das Schlüsselpaar erzeugt und hier kann der Safe entschlüsselt werden.
- Person C: Erhält von Person A die gültigen Codes und verifiziert die eingehenden Wahlzettel.

Da Person A die SChlüssel-Nutzer Zuordnung zu keinem Zeitpunkt kennt, kann sie auch die selbe Person wie Person C sein.

### Schritt 1
Auf System B wird ein Schlüsselpaar erzeugt. Dies besteht aus dem Öffentlichen und Privaten schlüssel.
- Der Öffentliche schlüssel dient zur Verschlüsselung der Daten und kann nicht zum entschlüsseln verwendet werden.
- Der Private schlüssel dient zur entschlüsselung des Safes und darf System B NIEMALS verlassen.

Dazu wird z.B. folgender Befehl ausgeführt:
`ts-node .\index.ts --privkey private.key --pubkey public.key --genkey

Der erzeugte Öffentliche schlüssel muss an Person A übergeben werden. Diese nutzt den Schlüssel auf System A zum verschlüsseln des Passwortsafes.

### Schritt 2
Auf System A werden jetzt die Codes erzeugt und an die Nutzer versendet.
Die Nutzer-Schlüssel zuweisung erfolgt temporär auf System A, ist jedoch nicht auslesbar und wird unmittelbar im Passwortsafe gespeichert.

Person A führt folgenden Befehl aus:
`ts-node .\index.ts --config config.json --pubkey public.key --send --safe .\out\credentials.json --mails mail.txt -html template.html

Dabei wird eine Liste mit den Mails und Namen sowie der schlüssel übergeben.

Der Ausfbau der mail.txt ist:
```
<mail>;<name>
<mail>;<name>
...
```
Doppelte Mailadressen werden erkannt und dedupliziert.

Es werden zwei Ausgaben erzeugt:
- Eine RegEx vorlage für alle Codes
- Safe-Datei

Die Speicherorte der Code-Files werden in der config.json angegeben.
Der Safe wird an Person B weitergegeben. 

Das Programm versendet automatisch Mails an alle Personen. Die HTML Vorlage wird mit --html angegeben.
In der Vorlage werden folgende Zeichenketten ersetzt:
`{{code}}
=> Genereirter Code
`{{name}}
=> Name
`{{mail}}
=> Mail

Der SMTP-Relay-Server wird in der config.json angegeben.
Geenaue Doku: https://nodemailer.com/smtp/

### Schritt 3
Ggf. muss der Safe entschlüsselt werden. Beispielfälle wären: 
- Teilnehmer hat keinen Zugriff auf das Mailkonto
- Teilnehmer hat seinen Code vergessen
- Mail wurd durch den Spamfilter entfernt

Person B muss dann mit dem Privaten Schlüssel den Safe auslesen und dem Teilnehmer seinen Code zukommen lassen.
Dazu muss golgender Befehl ausgeführt werden:
ts-node .\index.ts --privkey private.key --decrypt --safe .\out\credentials.json

## Config-Datei
```
{
    "mail":{
        "host": "<mailserver>",
        "port": <mailport>,
        "secure": <use ssl>,
        "auth": {
            "user": "<mail-user>",
            "pass": "<mail-password>"
        },
        "tls": {
            "rejectUnauthorized": false,
            "ciphers":"SSLv3"
        }
    },
    "mailFrom": "<absender name>",
    "outFileMatch": "<ausgabedatei regex>"
}
```

## CLI
Das Command-Line-Interface unterscheidet zwischen 3 Aktionen:
 - key
 - send
 - vault

Um Hilfe zu den Funktionen anzuzeigen verwenden sie folgendes Kommando:
`./opentoken-linux <action> -h` oder `./opentoken-linux <action> --help`

### Aktion: key
Die Aktion _key_ ist für das verwalten des RSA-Schlüsselpaars verantwortlich.
Derzeit wird allerdings nur das generieren eines Schlüsselpaars unterstützt.

Um ein schlüsselpaar zu generieren ist z.B. folgender Befehl zu verwenden:
`./opentoken-linux key --pubkey <pfad zur datei> --privkey <pfad zur datei> --generate`

```
Optional arguments:
  -h, --help            Show this help message and exit.
  -g, --generate        Send to all recipients, regardless if mail was 
                        already sent. Overwrites safe with new codes.
  -p PUBLICKEY, --pubkey PUBLICKEY
                        Specify the public key to use
  -r PRIVATEKEY, --privkey PRIVATEKEY
                        Specify the private key to use
```

### Aktion: send
Die Aktion _send_ ist für das genereiern der Codes und das Senden der Mails verantwortlich.

Um ein schlüsselpaar zu generieren ist z.B. folgender Befehl zu verwenden:
`./opentoken-linux key --pubkey <pfad zur datei> --config <pfad zur datei> --mails <pfad zur datei> --safe <pfad zur datei> --template <pfad zur datei>`

Mit den schalter `--dryrun` werden keine Mails versendet. Zudem werden keine änderungen im Safe vorgenommen.

Mit den schalter `--force` werden alle Mails versendet. Alle Codes werden neu generiert und der Safe wird überschrieben.

Bereits gesendete mails und verwendete Codes werden im safe unverschlüsselt, jedoch ohne Zuordnung hinterlegt. Somit ist es möglich,
nachträglich ohne Private-Key Teilnehmer hinzuzufügen, ohne alle Codes neu zu generieren und alle Mails neu zu versenden. Dies ist jedoch nicht empfohlen, da dadurch die Anonymität nicht gewährleistet werden kann.

Sollte also bereits ein safe unter dem angegebenen Dateinamen existieren, wird dieser so weit wie möglich eingelesen. Sollte dieser nicht existieren, wird ein neuer, leerer Safe erstellt.

```
  -h, --help            Show this help message and exit.
  -f, --force           Send to all recipients, regardless if mail was 
                        already sent. Overwrites safe with new codes.
  -d, --dryrun          Pretend to send mails. No outgoing SMTP connection. 
                        Safe will not be updated.
  -p PUBLICKEY, --pubkey PUBLICKEY
                        Specify the public key to use
  -c CONFIGFILE, --config CONFIGFILE
                        Specify the config file to use
  -m MAILLIST, --mails MAILLIST
                        Specify the maillist to use
  -s SAFEFILE, --safe SAFEFILE
                        Specify the safe file to use
  -t HTMLFILE, --template HTMLFILE
                        Specify the template file to use
```


### Aktion: vault
Die Aktion _vault_ ist für das verwalten des Safes verantwortlich.

Folgende operationen sind derzeit möglich:
 - auslesen der verschlüsselten und unverschlüsselten Daten
 - revoken (rückziehen) von codes
 - erzeugen einer codeliste aller gültigen codes

**Auslesen der verschlüsselten und unverschlüsselten Daten**

Das Auslesen ist mit folgendem Befehl möglich:
`./opentoken-linux key --pubkey <pfad zur datei> --privkey <pfad zur datei> --safe <pfad zur datei>`

Über das Parameter --filter, lässt sich einstellen, welcher Teil des Safes anzuzeigenist.

**Revoken eines token**

Falls ein token aus irgendwelchen Gründen als ungültig markiert werden soll, lässt sich dies mit folgendem Befehl im Safe hinterlegen:
`./opentoken-linux key --pubkey <pfad zur datei> --privkey <pfad zur datei> --safe <pfad zur datei> --revoke <tokenid>`

Der mit `--revoke` angegebene Token wird überprüft. Sollte dieser nicht existieren oder bereitz revoked sein, wird das Programm einfach beendet.
Andernfalls wird dieser Token zur revokationList hinzugefügt. 

**Erzeugen einer Code-Liste**

Es kann auch eine Liste mit allen aktuell gültigen codes (zurückgezogene ausgenommen) erzeugt werden.
Dazu kann folgendes Kommando verwendet werden:
`./opentoken-linux key --pubkey <pfad zur datei> --privkey <pfad zur datei> --safe <pfad zur datei> --get-codes`

Mit dem Parameter `--format` kann das Ausgabeformat angegeben werden. Zur auswahl stehen:
 - json : Ausgabe als JSON fomratierter string
 - regex : Ausgabe als vorformatierter RegEx String

```
  -h, --help            Show this help message and exit.
  --filter {encrypted,unencrypted,all}
                        Specify the data to show. This parameter may 
                        alternatively be specified via the DATATYPE 
                        environment variable. The default value is "all".
  -p PUBLICKEY, --pubkey PUBLICKEY
                        Specify the public key to use
  -r PRIVATEKEY, --privkey PRIVATEKEY
                        Specify the private key to use
  -s SAFEFILE, --safe SAFEFILE
                        Specify the safe file to use
  -g, --get-codes       Get a list of all non revoked codes
  --format {json,regex}
                        Specify the output format of --get-codes. This 
                        parameter may alternatively be specified via the 
                        FORMAT environment variable. The default value is 
                        "json".
  --revoke TOKEN        Revokes a token
```


## Gepackte Binaries
Die gepackten Binaries sind für Linux, MacOS und Windoof verfügbar: [Binaries](https://gitlab.dennisgunia.de/dennisgunia/one-time-code-js/-/tree/master/bin)

Die befehle ändern sich wie folgt:

==> Schlüsselpaar Erzeuge
`./opentoken --privkey <path-to-private-key> --pubkey <path-to-public-key> --genkey`

z.B. `./opentoken --privkey private.key --pubkey public.key --genkey`

==> Codes Erzeugen und versenden
`./opentoken --config <path-to-config-key> --pubkey <path-to-public-key> --send --safe .\out\credentials.json --mails <path-to-mail-list> -html <path-to-html-template>`

z.B. `./opentoken --config config.json --pubkey public.key --send --safe .\out\credentials.json --mails mail.txt -html template.html`

==> Safe entschlüsseln
`./opentoken --privkey <path-to-private-key> --decrypt --safe .\out\credentials.json`

z.B. `./opentoken --privkey private.key --decrypt --safe .\out\credentials.json`

## Ausführen des Quellcodes
Der Sourcecode kann auch über ts-node ausgeführt werden.
Dazu ist Node.js Version 12 zu verwenden

`nvm use 12`

Zum Ausführen sind folgende npm Pakete notwendig:
 - typescript
 - tslint
 - ts-node

Installerien sie diese mit:
`npm install -g typescript tslint ts-node`

Clonen sie dieses Repository auf ihren lokalen rechner und wechseln sie anschließend in dessen verzeichniss:

`git clone https://gitlab.dennisgunia.de/dennisgunia/one-time-code-js.git`

`cd one-time-code-js`

Installieren sie alle lokalen npm Pakete

`npm install`

Kopieren Sie die Config-Template und passen Sie die SMTP-Zugangsdaten an:

`cp config.template.json config.json`

`vim config.json`

Das Skript kann nun über `npm run-script exec` oder `ts-node index.js` ausgeführt werden.

## Packen des Quellcodes
Zum Packen des Quellcodes ist das npm-Paket `pkg` zu installieren:

`npm install -g pkg`

Anschließend wird der Code in JS transpiliert und durch pkg gepackt:

`npm run-script build`

Die Binaries werden in `./bin` gespeichert. Diese sind auch auf Systemen ohne node.js ausführbar.

## Was landet im Safe?
Im safe landen die verschlüsselten Zuordnungen zwischen Codes und Mailadressen.

Zudem werden die verwendeten Codes und die bereits gesendeten Mailadressen seperat voneinander und zufällig gemischt in Klartext gespeichert.

Dies ermöglicht es, nachträglich benutzer hinzuzufügen, ohne allen anderen neue Mails oder gar neue Codes zukommen lassen zu müssen.

Es ist jedoch nocht empfohlen, nachträglich mails hinzuzufügen, da dies, abhängig von der Menge der gleichzeitig hinzugefügten Adressen eine grobe oder ggf. auch sehr genaue zuordnung zwischen Code und Mail der Nachzügler möglich ist. 

## Logfile
Opentoken schreibt automatisch eine Logfile mit dem Namen `vault.log` in das aktuelle Verzeichniss. In dieser wird der aktuelle fortschritt dokumentiert. Sollte die Ausführung unerwartet unterbrochen werden, lässt sich aus dieser ermitteln, welche mailadressen bereits verarbeitet wurden. 

Zusätzlich werden die einzelnen verschlüsselten Safeeinträge in die Datei geschrieben. Diese können in einem zukünftigen Release mit Hilfe des Private-Keys in eine gültige Safe Datei umgewandelt werden. Diese kann genutzt werden, um nur die verbleibenden Mails zu generieren und zu verschicken.
