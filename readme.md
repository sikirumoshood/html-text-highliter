
### What is html-text-highliter ?
This is a lightweight library that helps you highlight selected text from an html page. Gives you the updated DOM which you can then use to replace the existing one. 

See it in action...

![here](https://res.cloudinary.com/offbox/image/upload/v1624734193/html-text-highlighter_lgrtp6.gif)

### Example ( for node project )

```javascript
const Parser = require('./parser');
const htmlText = `<div class = 'content' id="content">
      <h1>
          This is <b>Magic!</b>
      </h1>
      <section class="description">
         <a href="google.com">Lorem ipsum dolor sit amet</a> consectetur adipisicing elit. Similique quasi illum veritatis repudiandae <i><b>eligendi magni iste,</b></i> voluptas adipisci architecto commodi nihil corporis quam, temporibus qui, dolorem reprehenderit quaerat a officiis.
      </section>
      <p>
        Something
          <b>different</b>
          <span>Right now</span>
          brand new <span> Long <code>life</code> </span>

      </p>
    </div>`;

const searchText = `<h1><b>Magic!</b>
      </h1>
      <section class="description">
         <a href="google.com">Lorem ipsum</a></section>`;

const searchTextParser = new Parser(htmlText, searchText, { prefix: 'volley-id-'});
const result = searchTextParser.parse();
console.log(':::: RESULT :::::', result);

```

### Example ( for web )
See https://jsfiddle.net/sikirumoshood/c3495u8d/201/

