import { renderWelcome } from './components/welcome.js';

const app = document.getElementById('app');
app.innerHTML = renderWelcome();