import type { CSSProperties, HTMLAttributes } from 'react';
import type { TikTokText as CaptionElement } from './roundtext.js';
export type RoundTextStyle = CSSProperties & {
    '--rt-bg'?: string;
    '--rt-color'?: string;
    '--rt-outline'?: string;
    '--rt-radius'?: string;
    '--rt-px'?: string;
    '--rt-py'?: string;
    '--rt-stroke'?: string;
    '--rt-snap'?: string;
};
export type RoundTextProps = Omit<HTMLAttributes<CaptionElement>, 'style' | 'color'> & {
    size?: number;
    color?: string;
    variant?: 'box' | 'plain' | 'outline' | 'hollow';
    align?: 'left' | 'center' | 'right' | 'start' | 'end';
    snap?: 'on' | 'off';
    style?: RoundTextStyle;
    debug?: boolean;
};
/** Client-side registration keeps server rendering safe. Ref exposes refresh(). */
export declare const TikTokText: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<CaptionElement>, "color" | "style"> & {
    size?: number;
    color?: string;
    variant?: 'box' | 'plain' | 'outline' | 'hollow';
    align?: 'left' | 'center' | 'right' | 'start' | 'end';
    snap?: 'on' | 'off';
    style?: RoundTextStyle;
    debug?: boolean;
} & import("react").RefAttributes<CaptionElement>>;
export declare const RoundText: import("react").ForwardRefExoticComponent<Omit<HTMLAttributes<CaptionElement>, "color" | "style"> & {
    size?: number;
    color?: string;
    variant?: 'box' | 'plain' | 'outline' | 'hollow';
    align?: 'left' | 'center' | 'right' | 'start' | 'end';
    snap?: 'on' | 'off';
    style?: RoundTextStyle;
    debug?: boolean;
} & import("react").RefAttributes<CaptionElement>>;
