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

Es werden drei Ausgaben erzeugt:
- List aller Codes
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

## Syntax

==> Schlüsselpaar Erzeugen
`ts-node .\index.ts --privkey <path-to-private-key> --pubkey <path-to-public-key> --genkey`

z.B. `ts-node .\index.ts --privkey private.key --pubkey public.key --genkey`

==> Codes Erzeugen und versenden
`ts-node .\index.ts --config <path-to-config-key> --pubkey <path-to-public-key> --send --safe .\out\credentials.json --mails <path-to-mail-list> -html <path-to-html-template>`

Achtung: Es wird im Safe geprüft, ob Mailadressen bereits "bedient" wurden. Sollte dies der Fall sein, werden keine Mails an diese Adresse gesendet. Dies lässt sich mit dem Schalter `--force` umgehen.

z.B. `ts-node .\index.ts --config config.json --pubkey public.key --send --safe .\out\credentials.json --mails mail.txt -html template.html`

==> Safe entschlüsseln
`ts-node .\index.ts --privkey <path-to-private-key> --decrypt --safe .\out\credentials.json`

z.B. `ts-node .\index.ts --privkey private.key --decrypt --safe .\out\credentials.json`

### Erweiterte Schalter

 - `--dryrun` : Mails werden nicht versendet und der Safe wird nicht verändert.
 - `--force` : Alle Codes werden neu generiert und alle mails werden gesendet. Ignoriere bereits gesendete mails.

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
