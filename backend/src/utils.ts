export const generateRandomId = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomId = "";
    for (let i = 0; i < 8; i++) {
        randomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomId;
};

export const generateRoomCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let roomCode = "";
    for (let i = 0; i < 6; i++) {
        roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return roomCode;
};

export const generateMemberId = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let memberId = "";
    for (let i = 0; i < 12; i++) {
        memberId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return memberId;
};

export const parseYouTubeUrl = (input: string): { title: string; url: string } => {
    // Check if it's a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const match = input.match(youtubeRegex);

    if (match) {
        const videoId = match[1];
        return {
            title: `YouTube Video ${videoId}`, // In real app, you'd fetch the actual title
            url: `https://www.youtube.com/watch?v=${videoId}`
        };
    }

    // If it's not a YouTube URL, treat it as a song title/search query
    return {
        title: input.trim(),
        url: input.trim() // In real app, you'd search for the song and get actual URL
    };
};

export const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
};
