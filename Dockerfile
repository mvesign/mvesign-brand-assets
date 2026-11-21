# Het pakket als image: alleen de bestanden uit dist/, in /brand. Geen CMD: de container
# draait nooit. Wie de bestanden wil, maakt een container met een willekeurig commando
# (docker create <image> none) en kopieert eruit (docker cp <id>:/brand/. <map>).
FROM scratch
COPY dist/ /brand/
