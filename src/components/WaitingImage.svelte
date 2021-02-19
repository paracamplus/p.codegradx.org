<!-- spinning logo -->

<div class='w3-center'>
  <!-- ParacamplusLogo /-->
  <Picture image='/fw4ex-512x512' alt='logo' />
</div>

<style>
 div {
   animation: rotation 9s infinite linear;
   margin: auto;
   z-index: 99;
   height: 100px;
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
  import Picture from './Picture.svelte';
 //import ParacamplusLogo from './ParacamplusLogo.svelte';
</script>
