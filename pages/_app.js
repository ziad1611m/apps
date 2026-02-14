import '../app/globals.css';
import { AuthProvider } from '../lib/auth';
import { LanguageProvider } from '../lib/LanguageContext';
import Head from 'next/head';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
    return (
        <LanguageProvider>
            <AuthProvider>
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                    <title>Email Sender Pro</title>
                </Head>
                <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
                <Component {...pageProps} />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            fontFamily: 'Inter, sans-serif',
                            borderRadius: '8px',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10B981',
                                secondary: 'white',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: 'white',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </LanguageProvider>
    );
}

export default MyApp;

