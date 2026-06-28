import requests
from bs4 import BeautifulSoup


def print_secret_message(doc_url):
    response = requests.get(doc_url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    rows = soup.find_all("tr")

    coordinates = []
    for row in rows[1:]:
        cols = row.find_all("td")

        if len(cols) < 3:
            continue

        try:
            x = int(cols[0].get_text(strip=True))
            char = cols[1].get_text(strip=True)
            y = int(cols[2].get_text(strip=True))

            coordinates.append((x, y, char))

        except ValueError:
            continue

    max_x = max(x for x, _, _ in coordinates)
    max_y = max(y for _, y, _ in coordinates)

    grid = [
        [" " for _ in range(max_x + 1)]
        for _ in range(max_y + 1)
    ]

    for x, y, char in coordinates:
        grid[y][x] = char

    for row in grid:
        print("".join(row))


doc_url = "https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub"
print_secret_message(doc_url)