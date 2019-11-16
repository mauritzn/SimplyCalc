class Main {
  static readonly apiUrl = (process.env.NODE_ENV === "production" ? `https://mauritz.cloud/electron-calc-api` : `http://127.0.0.1:3054`);
}

export default Main;