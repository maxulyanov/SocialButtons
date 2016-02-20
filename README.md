# Social Buttons

Готовое решение для добавления кнопок социальных сетей на сайт.

[![](http://m-ulyanov.github.io/social-buttons/social-buttons-promo.png)](https://github.com/M-Ulyanov/SocialButtons)

## Быстрый старт
- Подключить SocialButtons.css и SocialButtons.js или их минифицированные версии
- Создать экземпляр кнопок с помощью вызова new SocialButtons, передав нужные параметры
- При необходимости подключить es6-promise.js
- Никакие дополнительные библиотеки (например jQuery) для работы не требуются

## Какие сервисы поддерживаются?
На данный момент это - Вконтакте, Facebook, Google+, Одноклассники, Twitter<br>
Функциональные названия:<br>
`['facebook', 'vkontakte', 'odnoklassniki', 'googlePlus', 'twitter']`

## Параметры
todo update..

## Рекомендации
Используйте Open Graph разметку на странице. <br>
Это поможет подхватывать социальным сетям правильные данные при публикации.<br>
`<meta property="og:url" content="share url">`<br>
`<meta property="og:title" content="share title">`<br>
`<meta property="og:description" content="share content">`<br>
`<meta property="og:image" content="share image">`

## Проблемы и решения
#### Скрипт не работает, не отображается ни одна кнопка
Стоит проверить консоль:<br>
Ошибка: `#yourID not found!`<br>
Решение: <br>
- Вызов new SocialButtons необходимо осущеставить после загрузки DOM дерева - DOMContentLoaded<br>
- Проверьте наличие элемента c ID - yourID на вашей странице<br>

Ошибка: `Uncaught ReferenceError: Promise is not defined`<br>
Решение: Подключите файл `es6-promise.js`

#### Не отображается счетчик публикаций
Некоторые социальные сети не позволяют получить количество публикаций (шаринга), например у Twitter, такая возможность отсутствует<br>
#### Публикуется неправильный контент

Выполните рекомендации из предыдущего раздела

## Кроссбраузерность
Все современные браузеры.<br>
IE начиная с 9 версии и выше.

## Демонстрация
 <a href="https://m-ulyanov.github.io/social-buttons/">Посмотреть пример</a>
