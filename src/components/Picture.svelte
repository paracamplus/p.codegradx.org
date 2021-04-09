<style>
 .videoWrapper {
   height: 100px;
 }
 .videoWrapper img {
   top: 0;
   left: 0;
   width: 20%;
   height: auto !important;
 }
</style>

<picture class='videoWrapper' style='height: {height}'>
  <source srcset='{image}.webp' type='image/webp' />
  <img src='{image}.png' alt={alt} />
</picture>

<script>
 export let image = '';
 export let alt = '';
 export let height = '100px';
</script>
