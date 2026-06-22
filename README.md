# Instrukcja — strona Mateusz Arendt Photography

## 1. Jak działa hosting

Strona jest hostowana przez **Cloudflare Pages**, połączone z repozytorium na **GitHub**.

**Najważniejsze: nie musisz nic "wgrywać" ręcznie na serwer.** Wystarczy, że zmienisz pliki w repozytorium na GitHub (przez przeglądarkę albo lokalnie na komputerze) — Cloudflare automatycznie wykrywa zmianę i publikuje nową wersję strony w ciągu ok. 1 minuty.

## 2. Jak dodać/podmienić zdjęcia (najczęstsza czynność)

Każda kategoria ma swój folder w `assets/images/`:
```
assets/images/automotive/
assets/images/people/
assets/images/travel/
assets/images/sports/
assets/images/brand/
```

W każdym z tych folderów jest plik **`manifest.txt`** — to lista zdjęć, które mają się pokazać w galerii.

### Krok po kroku (przez przeglądarkę, na GitHub):

1. Wejdź do swojego repozytorium na github.com
2. Wejdź do folderu odpowiedniej kategorii, np. `assets/images/automotive/`
3. Kliknij **Add file → Upload files**
4. Przeciągnij **wszystkie nowe zdjęcia naraz** (możesz wrzucić kilkanaście plików jednocześnie)
5. Na dole wpisz opis zmiany, np. „Nowe zdjęcia automotive" → **Commit changes**
6. Wróć do folderu, otwórz plik **`manifest.txt`** (ikona ołówka = edytuj)
7. Dopisz nazwy nowych plików, **każda w nowej linii**, dokładnie tak jak się nazywają (z rozszerzeniem `.jpg`/`.png` itd.)
8. **Commit changes**

Gotowe — strona zaktualizuje się sama w ciągu minuty. Nie musisz nic zmieniać w plikach `.html`.

### Przykład zawartości manifest.txt

```
# linie zaczynające się od # są ignorowane (to tylko notatki)
bmw-m4-nocna-sesja.jpg
porsche-911-tor.jpg
audi-rs6-studio.jpg
```

Kolejność nazw w pliku = kolejność zdjęć na stronie.

### Usuwanie zdjęcia

Po prostu usuń jego nazwę z `manifest.txt` (sam plik zdjęcia możesz zostawić w folderze albo też usunąć — jeśli go nie ma na liście, nie pokaże się na stronie).

### Dodawanie krótkich filmów (teaserów)

Galeria obsługuje też wideo — działa dokładnie tak samo jak zdjęcia. Wgraj plik wideo (`.mp4`, `.webm` lub `.mov`) do folderu kategorii i dopisz jego nazwę do `manifest.txt`. Strona automatycznie pokaże odtwarzacz zamiast obrazka, z ikoną play w rogu. Film odtwarza się sam (bez dźwięku, w pętli) gdy pojawi się na ekranie, i zatrzymuje gdy zjedziesz dalej.

**Ważne:** trzymaj filmy krótkie i lekkie. GitHub odrzuca pliki powyżej 100 MB. Dla kilkunastosekundowego teasera celuj w 1080p, dobrze skompresowany (H.264) — zwykle wyjdzie 10-30 MB. Jeśli plik jest cięższy, skompresuj go np. przez [handbrake.fr](https://handbrake.fr) (darmowe) zanim wgrasz.

### Jeśli galeria jest pusta

Dopóki `manifest.txt` nie ma żadnych nazw plików, strona pokaże delikatny komunikat z instrukcją zamiast pustego miejsca — to nie błąd, tylko stan oczekujący na Twoje zdjęcia.

## 3. Zmiana tekstów na stronie

Teksty (nagłówki, opisy, dane kontaktowe) są bezpośrednio w plikach `.html` — `index.html`, `automotive.html`, `contact.html` itd.

1. Wejdź do pliku na GitHub → ikona ołówka (Edit)
2. Znajdź tekst do zmiany (Ctrl+F w przeglądarce pomaga)
3. Zmień, **Commit changes**

## 4. Zmiana zdjęcia w sekcji "O mnie" na stronie głównej

To jedno zdjęcie nie jest częścią auto-galerii (to pojedynczy element wizerunkowy). W pliku `index.html` znajdź:

```html
<div class="about-panel" data-reveal="right">
  <div class="ph"></div>
  <!-- <img src="assets/images/hero/about.jpg" alt="Mateusz Arendt przy pracy"> -->
</div>
```

Wgraj swoje zdjęcie do `assets/images/hero/`, usuń linię `<div class="ph"></div>` i odkomentuj linię z `<img>`, wpisując prawdziwą nazwę pliku.

## 5. Kolory i czcionki

Wszystkie kolory są zebrane na górze pliku `css/style.css`, w sekcji `:root{ ... }`:

```css
--paper:   #f7f7f5;   /* tło jasnych sekcji */
--ink:     #10182b;   /* główny kolor tekstu */
--navy:    #0d1730;   /* tło hero i sekcji kontaktowej */
--blue:    #2b4c7e;   /* kolor akcentu (linki, przyciski) */
```

Zmiana jednej wartości zmienia kolor wszędzie na stronie, gdzie jest używany.

## 6. Praca lokalnie na komputerze (opcjonalnie, do większych zmian)

Jeśli wolisz edytować pliki w edytorze typu VS Code zamiast w przeglądarce GitHub:

1. Na GitHub: **Code → Download ZIP** (albo `git clone`, jeśli znasz Git)
2. Edytuj pliki lokalnie
3. Wróć na GitHub → **Add file → Upload files** → przeciągnij zmienione pliki → **Commit changes**

## 7. Jak sprawdzić, czy zmiana się opublikowała

1. Wejdź na [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → Twój projekt
2. Zakładka **Deployments** pokazuje historię wdrożeń — każdy commit z GitHub pojawia się tam automatycznie
3. Status „Success" = zmiana jest już opublikowana na `mateuszarendt.com`

## 8. Jeśli coś nie działa

- **Zdjęcie się nie pokazuje** → sprawdź, czy nazwa pliku w `manifest.txt` **dokładnie** zgadza się z nazwą wgranego pliku (wielkość liter ma znaczenie: `Foto.jpg` ≠ `foto.jpg`)
- **Strona nie aktualizuje się** → sprawdź zakładkę Deployments w Cloudflare Pages — może build się nie powiódł (rzadkie przy czystym HTML, ale możliwe przy błędzie w kodzie)
- **Strona wygląda "goło"** (bez stylu) → sprawdź, czy folder `css/` nie został przypadkiem usunięty lub przeniesiony
