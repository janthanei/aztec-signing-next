export async function connectToPXE() {
    const response = await fetch('http://localhost:3001/api/pxe-connection');
    const data = await response.json();
    return data.message;
  }
  