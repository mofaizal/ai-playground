
Update `layout.js` file

- [ ] open `layout.js` file update following script 
 
```js
import Link from 'next/link';

```

- [ ] go to `return()` look for `<html>` block and replace below script 

```js
<html lang="en">
  <body>
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '220px', backgroundColor: '#2c3e50', color: '#ecf0f1', padding: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: '#fff' }}>Navigation</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/single-message" style={{ color: '#ecf0f1', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '5px', backgroundColor: '#34495e', transition: 'background-color 0.3s ease' }}>
              Single Message
            </Link>
          </li>
        </ul>
      </aside>
      <main style={{ flex: 1, padding: '30px', backgroundColor: '#f9f9f9' }}>{children}</main>
    </div>
  </body>
</html>
  );
```