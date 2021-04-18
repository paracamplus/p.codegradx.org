<!-- spinning logo -->

<div class='w3-center'>
  <!-- ParacamplusLogo /-->
  <Picture image='/fw4ex-512x512' alt='logo' height={height} />
</div>

<style>
 div {
   animation: combined 9s infinite linear;
   margin: auto;
   z-index: 99;
   height: 50px;
 }
 @keyframes rotation {
   0% { transform: rotate(0deg); }
   100% {   transform: rotate(359deg); }
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
     transform: scale3d(0.75, 0.75, 0.75) rotate(270deg);
   }
   100% {
     transform: scale3d(1, 1, 1) rotate(359deg);
     opacity: 0;
   }
 }
</style>

<script>
  import Picture from './Picture.svelte';
 //import ParacamplusLogo from './ParacamplusLogo.svelte';

 export let height = '50px';
</script>
