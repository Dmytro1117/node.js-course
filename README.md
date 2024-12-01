# Node.js Task-5

## Критерії прийому

- Створено репозиторій з домашнім завданням — Multer.
- Посилання на репозиторій надіслане ментору на перевірку.
- Код відповідає технічному завданню проєкту.
- При виконанні коду не виникає необроблених помилок.
- Назва змінних, властивостей і методів записана в нотації СamelCase.
- Використовуються англійські слова, назви функцій та методів містять дієслово.
- У коді немає закоментованих ділянок коду.
- Проєкт коректно працює з актуальною LTS-версією Node.

## Крок 1

Створи гілку `05-avatars` з гілки main.

Продовж створення REST API для роботи з колекцією контактів. Додай можливість завантаження аватарки користувача через [Multer](https://github.com/expressjs/multer).

## Крок 2

Створи папку `public` для роздачі статики. У цій папці зроби папку `avatars`. Налаштуй Express на роздачу статичних файлів з папки `public`.

Поклади будь-яке зображення в папку `public/avatars` і перевір, що роздача статики працює. При переході по такому URL браузер відобразить зображення.

`http://localhost:<порт>/avatars/<ім'я файлу з розширенням>`

## Крок 3

У схему користувача додай нову властивість `avatarURL` для зберігання зображення.

```
{
  ...
  avatarURL: String,
  ...
}
```

Використовуй пакет [gravatar](https://www.npmjs.com/package/gravatar) для того, щоб при реєстрації нового користувача відразу згенерувати йому аватар по його `email`.

## Крок 4

При реєстрації користувача:

- Створюй посилання на аватарку користувача за допомогою [gravatar](https://www.npmjs.com/package/gravatar).
- Отриманий URL збережи в поле `avatarURL` під час створення користувача.

## Крок 5

Додай можливість поновлення аватарки, створивши ендпоінт /`auth/avatars` і використовуючи метод `PATCH`.

avatar upload from postman

```
# Запит
PATCH /users/avatars
Content-Type: multipart/form-data
Authorization: "Bearer {{token}}"
RequestBody: завантажений файл

# Успішна відповідь
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "avatarURL": "тут буде посилання на зображення"
}

# Неуспішна відповідь
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Not authorized"
}
```

- Створи папку `temp` в корені проекту і зберігай в неї завантажену аватарку.
- Оброби аватарку пакетом [jimp](https://www.npmjs.com/package/jimp) і постав для неї розміри 250 на 250.
- Перенеси аватарку користувача з папки `temp` в папку `public/avatars` і дай їй унікальне ім'я для конкретного користувача.
- Отриманий `URL /avatars/<ім'я файлу з розширенням>` та збережи в поле `avatarURL` користувача.

## Додаткове завдання - необов'язкове

Написати unit-тести для контролера входу (логін)

За допомогою [Jest](https://jestjs.io/ru/docs/getting-started):

- відповідь повина мати статус-код 200;
- у відповіді повинен повертатися токен;
- у відповіді повинен повертатися об'єкт `user` з 2 полями `email` и `subscription` з типом даних `String`
