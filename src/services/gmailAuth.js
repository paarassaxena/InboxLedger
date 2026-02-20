import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Only using the Web Client ID for now
const WEB_CLIENT_ID = '1054722825357-jep07khpk44ttt30oqhql7kj61iujto4.apps.googleusercontent.com';

let isInitialized = false;

export const initGoogleAuth = () => {
    if (isInitialized) return;
    GoogleAuth.initialize({
        clientId: WEB_CLIENT_ID,
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
        grantOfflineAccess: false,
    });
    isInitialized = true;
};

export const signInWithGoogle = async () => {
    if (!isInitialized) initGoogleAuth();

    try {
        const user = await GoogleAuth.signIn();
        return user;
    } catch (error) {
        console.error('Error signing in with Google', error);
        throw error;
    }
};

export const signOutFromGoogle = async () => {
    try {
        await GoogleAuth.signOut();
    } catch (error) {
        console.error('Error signing out', error);
    }
};
