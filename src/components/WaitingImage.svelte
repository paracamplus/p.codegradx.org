<!-- spinning logo -->

<div class='w3-center'>
  <!-- ParacamplusLogo /-->
  <img src='/fw4ex-512x512.png' width='100px' alt='logo' />
</div>

<style>
 div {
   animation: rotation 9s infinite linear;
   margin: auto;
   z-index: 99;
 }
 img {
   margin: 0;
   padding: 0;
 }
 @keyframes rotation {
   from {
     transform: rotate(0deg);
   }
   to {
     transform: rotate(359deg);
   }
 }
</style>

<script>
 //import ParacamplusLogo from './ParacamplusLogo.svelte';
</script>
