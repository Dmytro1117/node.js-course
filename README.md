# Node.js Task-4

## Критерії прийому

- Створено репозиторій з домашнім завданням — CLI додаток.
- Посилання на репозиторій надіслане ментору на перевірку.
- Код відповідає технічному завданню проєкту.
- При виконанні коду не виникає необроблених помилок.
- Назва змінних, властивостей і методів записана в нотації СamelCase.
- Використовуються англійські слова, назви функцій та методів містять дієслово.
- У коді немає закоментованих ділянок коду.
- Проєкт коректно працює з актуальною LTS-версією Node.

## Крок 1

Створи гілку `04-auth` з гілки master.

Продовж створення REST API для роботи з колекцією контактів. Додай логіку аутентифікації / авторизації користувача через [JWT](https://jwt.io/).

## Крок 2

У коді створи схему і модель користувача для колекції `users`.

```
{
  password: {
    type: String,
    required: [true, 'Set password for user'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: String
}
```

Змініть схему контактів, щоб кожен користувач бачив тільки свої контакти. Для цього в схемі контактів додайте властивість

```
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    }
```

Примітка: `'user'` - назва колекції, у якій зберігаються користувачі

## Крок 3

### Регістрація

Створити ендпоінт [`/users/register`](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#registration-request)

Зробити валідацію всіх обов'язкових полів (email і password). При помилці валідації повернути [Помилку валідації](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#registration-validation-error).

У разі успішної валідації в моделі `User` створити користувача за даними, які пройшли валідацію. Для засолювання паролів використовуй [bcrypt](https://www.npmjs.com/package/bcrypt) або [bcryptjs](https://www.npmjs.com/package/bcryptjs)

- Якщо пошта вже використовується кимось іншим, повернути [Помилку Conflict](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#registration-conflict-error).
- В іншому випадку повернути [Успішна відповідь](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#registration-success-response).

### Registration request

```
POST /users/register
Content-Type: application/json
RequestBody: {
  "email": "example@example.com",
  "password": "examplepassword"
}
```

### Registration validation error

```
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Помилка від Joi або іншої бібліотеки валідації>
```

### Registration conflict error

```
Status: 409 Conflict
Content-Type: application/json
ResponseBody: {
  "message": "Email in use"
}
```

### Registration success response

```
Status: 201 Created
Content-Type: application/json
ResponseBody: {
  "user": {
    "email": "example@example.com",
    "subscription": "starter"
  }
}
```

### Логін

Створити ендпоінт [/users/login](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#login-request)

В моделі `User` знайти користувача за `email`.

Зробити валідацію всіх обов'язкових полів (email і password). При помилці валідації повернути [Помилку валідації](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#validation-error-login).

- В іншому випадку, порівняти пароль для знайденого користувача, якщо паролі збігаються створити токен, зберегти в поточному юзера і повернути [Успішна відповідь](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#login-success-response).
- Якщо пароль або імейл невірний, повернути [Помилку Unauthorized](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#login-auth-error).

### Login request

```
POST /users/login
Content-Type: application/json
RequestBody: {
  "email": "example@example.com",
  "password": "examplepassword"
}
```

### Login validation error

```
Status: 400 Bad Request
Content-Type: application/json
ResponseBody: <Помилка від Joi або іншої бібліотеки валідації>
```

### Login success response

```
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "token": "exampletoken",
  "user": {
    "email": "example@example.com",
    "subscription": "starter"
  }
}
```

### Login auth error

```
Status: 401 Unauthorized
ResponseBody: {
  "message": "Email or password is wrong"
}
```

## Крок 4

### Перевірка токена

Створи мідлвар для перевірки токена і додай його до всіх раутів, які повинні бути захищені.

- Мідлвар бере токен з заголовків `Authorization`, перевіряє токен на валідність.
- У випадку помилки повернути [Помилку Unauthorized](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#middleware-unauthorized-error).
- Якщо валідація пройшла успішно, отримати з токена `id` користувача. Знайти користувача в базі даних з цим `id`.
- Якщо користувач існує і токен збігається з тим, що знаходиться в базі, записати його дані в `req.user` і викликати `next()`.
- Якщо користувача з таким `id` НЕ існує або токени не збігаються, повернути [Помилку Unauthorized](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#middleware-unauthorized-error).

### Middleware unauthorized error

```
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Not authorized"
}
```

## Крок 5

### Логаут

Створити ендпоінт [`/users/logout`](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#logout-request).

Додай в маршрут мідлвар перевірки токена.

- У моделі User знайти користувача за `_id`.
- Якщо користувача не існує повернути [Помилку Unauthorized](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#logout-unauthorized-error).
- В іншому випадку, видалити токен у поточного юзера і повернути [Успішна відповідь](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#logout-success-response).

### Logout request

```
POST /users/logout
Authorization: "Bearer {{token}}"
```

### Logout unauthorized error

```
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Not authorized"
}
```

### Logout success response

```
Status: 204 No Content
```

## Крок 6

### Поточний користувач - отримати дані юзера по токені

Створити ендпоінт [`/users/current`](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#current-user-request).

Додай в раут мідлвар перевірки токена.

- Якщо користувача не існує повернути [Помилку Unauthorized](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#current-user-unauthorized-error).
- В іншому випадку повернути [Успішну відповідь](https://textbook.edu.goit.global/lms-nodejs-homework/v1/uk/docs/hw-04/#current-user-success-response).

### Current user request

```
GET /users/current
Authorization: "Bearer {{token}}"
```

### Current user unauthorized error

```
Status: 401 Unauthorized
Content-Type: application/json
ResponseBody: {
  "message": "Not authorized"
}
```

### Current user success response

```
Status: 200 OK
Content-Type: application/json
ResponseBody: {
  "email": "example@example.com",
  "subscription": "starter"
}
```

### Додаткове завдання - необов'язкове

- Зробити пагінацію для колекції контактів (GET /contacts?page=1&limit=20).
- Зробити фільтрацію контактів по полю обраного (GET /contacts?favorite=true)
- Оновлення підписки (`subscription`) користувача через ендпоінт `PATCH /users`. Підписка повинна мати одне з наступних значень `['starter', 'pro', 'business']`
