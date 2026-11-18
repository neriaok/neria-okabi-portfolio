import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(ScrollTrigger, Flip);
gsap.defaults({ ease: 'expo.out', duration: 1 });

export { gsap, ScrollTrigger, Flip };
