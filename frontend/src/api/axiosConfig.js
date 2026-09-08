import axios from 'axios';

export default axios.create({
    headers: {
        "ngrok-skip-browser-warning": "true",
    }
})