import * as admin from 'firebase-admin';

import type { Bucket } from '@google-cloud/storage';

export const app = admin.initializeApp({
  credential: admin.credential.cert({
    type: 'service_account',
    project_id: 'bluedibs-official-production',
    private_key_id: '85142f7ddc4a98014a5a91f14d1426b841b01878',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDtsHFTt5gvEZnM\nQAvvTyQ9UH69pi/w777eePo0APL0+aUlt3yN8fWGFo4rsWH2nXbVGKr35AuJzuMY\nXl+MAjW8FjjBphdtBPqMn8jBP0Da4rzTxMa16RwRPcFaACW31h5Uzb5Hz2ln/8LJ\ngYmrEC3cIIO64HZUOc+wL+w9R0z6T1ektoENLR0bCz6ncW9m66Lqt+yvIzGMjxnU\nwecDbix5ssYmV/qdmvXg42ut10Pmh/bzWrotLJsMFrXKfPrHWuNjIGWuVawKivPD\n2wGG+Faq7pYsLmMHwcxlsLNt8Uv4OPS58Pm8FawKUsuVebSl5OWzkFs9j/u7Ar68\niD/fZq2/AgMBAAECggEAJxWK5Qm9AAxkXlYvwDeizWRFmvjPTE6X86wv9EotqUO9\nuMB9vjeJuHVQBnZCFhPZfPvz7RQ2I4B+Dj1Cd9rLLDT5OzqNApO9gU8q6z/z8ao0\nA5yJUlNVFq6xcxOwIBUY4rf8MIG2IvBG/uyKjzL3X4mHL70GKB5jfOS8c20chtIh\nBsPrf8eGKQKnqL0fil1hw2Yvp8KS+GiIm2eyvkAgNroY6KIhlKGtKC7dMOOScJOl\n7EeBVWDgL2yZy+bWJ3qfh4hnmElf0/7/fntU2tvplz4NTbkY2nvELbAqZ6JdjPZO\n/o6+Bs/PO39jXuRFNP4ySOp+SZ7OE/dHVPtBH0AtEQKBgQD3hHjiXPqpf1Zk6vcJ\n1x2fNv9NFcKv9Bdn15CQl3RZPN1ryDvks2Xt/FjXoA0IavA/6KJ7c2kuaAHWpXEM\nIBRB4nnMIXIcZrRq8LhrL7wnoDrH+jOkzDKm++UlvN73E++cGUwgBMQYdfDv7zp3\nrTdcjLlMXVdG/n1yNaYg7xx4cQKBgQD11b68bN+tZ38ZlNXlV6AFXr/U94ap7sJJ\nbl44Sg5o+Kv60WTIrgpfBNwrUnv8dMjda6Gsuk4GEeVbCnkZTHnoHJtD9IK7O/W2\nsmeBa2u7OweBqSONlGbIKZycUWDi5MnpUyXyd8nrlgfH2sFF2YNZ+IjBaCXNyrrW\nJcfzqwYhLwKBgGf2fWvez+43rQsQYhkBANEqIYu4MyECrn4QXglNhDIjTYGDBh0m\neQ6/6nUPJco+WJEPXofpzukOCI+mx9fm9XtC7BOgjLR/MxKj72IeF7KxK19pqR10\nI2Zd8T6rmR9AgWkYexAL0G3RxBSTcARqfhFijkYUAp+wLvK0tAWrSVMRAoGBAMlP\nPoEIWuaiAQfOxJWo+sZK/6YDCIhxlzIQqiFIK6K0OAkNnY1kT+Pdk/n58sQaUj5X\nnC5Y5fm8f+fcnKwl3xI/ErpEKSXwBNeWIoJtl+vbe9smyZFvu/cfdDrhvQgwOFPU\nHhf/Fh/QXRDAx1JOu2xaxIo0ofhykis5BxM3sq5LAoGADL14sh3wFx1yRnQ4pEy7\nV2+lTdeGC2V4iyg/hHvJ3iLdYlBwNgk7aFzPNNzw/uv9KiaMiDWPLKoUuVoKrYhp\n+EwlMuf31S/deblQCvU74f69djNJIDzzz+0FTldcjNiDQxenIgZc/bDmrk4cqUvH\ncA9BEkHj6fTNgK7Y2UG8SnE=\n-----END PRIVATE KEY-----\n',
    client_email:
      'firebase-adminsdk-8ptq7@bluedibs-official-production.iam.gserviceaccount.com',
    client_id: '116984598279206472367',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-8ptq7%40bluedibs-official-production.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
  } as admin.ServiceAccount),
  storageBucket: process.env.BUCKET_URL,
});

export const bucket: Bucket = admin.storage().bucket(process.env.BUCKET_URL);
