export interface Rectangle { left: number; right: number; top: number; bottom: number; }
export interface RenderDetail { lines: number; path: string; rectangles: Rectangle[]; unsnapped: Rectangle[]; }
export function outline(rectangles: Rectangle[], radius?: number): string;
export function snapLines(rectangles: Rectangle[], threshold: number): Rectangle[];
export function ready(): Promise<void>;
export const colors: Readonly<Record<'black'|'white'|'red'|'orange'|'yellow'|'green'|'teal'|'cyan'|'blue'|'indigo'|'purple', {background:string;text:string;outline:string;ink:string}>>;
export class RoundText extends HTMLElement { refresh(): void; }
export class TikTokText extends RoundText {}
declare global {
  interface HTMLElementTagNameMap { 'round-text': RoundText; 'tiktok-text': TikTokText; }
  interface HTMLElementEventMap { 'roundtext:render': CustomEvent<RenderDetail>; 'roundtext:error': CustomEvent<{message:string}>; }
}
