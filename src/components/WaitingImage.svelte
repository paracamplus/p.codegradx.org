<!-- spinning logo -->

<div>
  <div class='w3-left waitingMessage'>{message}</div>
  <div bind:this={picture}
       class='w3-center animate'>
    <picture style='height: {height};'>
      <source srcset='/fw4ex-512x512.webp'
              type='image/webp'
              alt='logo' />
      <img src='/fw4ex-512x512.png' alt='logo' />
    </picture>
  </div>
</div>

<style>
 :global(div.animate) {
   animation: combined 9s infinite linear;
   margin: auto;
   z-index: 99;
   height: 33px;
 }
 @keyframes rotation {
   0%   { transform: rotate(0deg); }
   100% { transform: rotate(359deg); }
 }
 @keyframes zoom-in {
   0% {
     opacity: 0;
     transform: scale3d(.3, .3, .3);
   }
   50% {
     opacity: 1;
   }
 }
 @keyframes combined {
   0% {
     transform: scale3d(.0, .0, .0) rotate(0deg);
     opacity: 0.1;
   }
   25% {
     transform: scale3d(.25, .25, .25) rotate(90deg);
     opacity: 0.5;
   }
   50% {
     opacity: 1;
     transform: scale3d(.5, .5, .5) rotate(180deg);
   }
   75% {
     opacity: 0.5;
     transform: scale3d(0.25, 0.25, 0.25) rotate(270deg);
   }
   100% {
     transform: scale3d(0, 0, 0) rotate(359deg);
     opacity: 0.1;
   }
 }
</style>

<script>
 //import ParacamplusLogo from './ParacamplusLogo.svelte';

 import { onMount } from 'svelte';

 export let height = '33px';
 export let message = undefined;
 let picture = undefined;

 onMount(() => {
   picture.classList.add('animate');
 });
 
</script>
