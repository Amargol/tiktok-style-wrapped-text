'use client';
import { createElement, forwardRef, useEffect } from 'react';
/** Client-side registration keeps server rendering safe. Ref exposes refresh(). */
export const TikTokText = forwardRef(function TikTokText({ children, debug, className, ...props }, ref) {
    useEffect(() => { void import('./roundtext.js'); }, []);
    return createElement('tiktok-text', {
        ...props, ref, class: className, ...(debug ? { debug: '' } : {}),
    }, children);
});
export const RoundText = TikTokText;
