import axios from 'axios'

const AXIOS = axios.create({
  baseURL: `/api`,
  timeout: 1000
});


export default {
    hello() {
        return AXIOS.get(`http://localhost:9090//people/{role}`);
    }
}