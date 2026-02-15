import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { activation_key } = body;

        if (!activation_key) {
            return NextResponse.json(
                { success: false, message: 'Activation key is required' },
                { status: 400 }
            );
        }

        // Forward the request to the InfinityFree server
        const response = await fetch('https://email-sender.wuaze.com/api/activate.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Optional: Add a User-Agent to mimic a browser if InfinityFree blocks server tools
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: JSON.stringify({ activation_key }),
        });

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });

    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to communicate with the server', error: error.message },
            { status: 500 }
        );
    }
}
