<style>
 p.smallHint {
   color: #aaa;
 }
 .personName {
   color: #334191;
   padding: 0.1em 0.5em 0.1em 0.5em;
   border-radius: 0.5em;
   border: solid 1px #334191;
 }
 li span.va {
   vertical-align: 0px;
   width: 80vw;
 }
 .videoWrapper {
   height: 100px;
 }
 .videoWrapper iframe, .videoWrapper img {
   top: 0;
   left: 0;
   width: 20%;
   height: auto !important;
 }
 span.underline {
   color: red;
 }
</style>

<svelte:head>
  <title>CodeGradX/Univers</title>
</svelte:head>

<Header />
<div class='w3-container' on:click={hideProblem}>
  <header>
    {#if $person}
      <p>Bonjour <span class='personName'>{$person.pseudo}</span>,
        sélectionnez l'univers d'exercices que vous souhaitez.
      </p>
    {:else}
      <p> Sélectionnez,
        <span class:underline={underline}>après vous être identifié</span>,
        l'univers d'exercices que vous souhaitez. <br />
    {/if}
    <p class='smallHint'>
      Le titre indique s'il est en anglais ou en français.
    </p>
  </header>

  {#if ! $person}
  <div class='w3-container'>
    <div class='w3-center w3-animate-zoom'>
      <span class='w3-btn w3-center w3-round-xlarge w3-theme-d4'
            on:click={connect} >
        Je m'identifie...
      </span>
    </div>
  </div>
  {/if}
  
  {#if error}<Problem bind:error={error} />{/if}
  
  <div class='w3-container'>
    <ul class='w3-ul'>
      
      <li lang='fr'>
        <span class='va'>
          <a href='https://scm.codegradx.org/doc/exercises'
             on:click={go}
             class='w3-btn w3-round-xlarge w3-theme-l4' >Scheme</a> 
          exercices issus du <a href='https://programmation-recursive.net/'
                class='w3-btn w3-round-xlarge w3-theme-l4' >
            MOOC « Programmation récursive »</a>
        </span>
        <span on:click={() => {showmoocprogrec = ! showmoocprogrec}}
              class='videoWrapper'>
          {#if showmoocprogrec}
          <iframe width='560' height='315'
                  title="Bande annonce du MOOC programmation récursive"
                  src="https://www.youtube.com/embed/nu9_3ZZ1k2M"
                  frameborder='0'
                  allowfullscreen ></iframe>
          {:else}
          <img src='/moocprogrec.png' 
               alt='Video du MOOC Programmation récursive' />
          {/if}
          </span>
      </li>
      
      <li lang='fr'>
        <span class='va'>
          <a href="https://unx.codegradx.org/"
             on:click={go}
           class='w3-btn w3-round-xlarge w3-theme-l4' > 
          <tt>shell</tt>
          </a> et autres utilitaires Unix (sed, tr, head, tail, cut,
          grep, sh, etc.)</span></li>
      
      <li lang='en'>
        <span class='va'><em>
          <a href="https://js.codegradx.org/"
             on:click={go}
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            Javascript </a>
          exercices from the <a href='https://diffusejavascript.codegradx.org/'
                      class='w3-btn w3-round-large w3-theme-l4'>
            MOOC « Diffuse JavaScript »</a></em>
        </span>
        <span on:click={() => {showmoocjs = ! showmoocjs}}
              class='videoWrapper'>
          {#if showmoocjs}
          <iframe width='560' height='315'
                  title="Teaser for the Diffuse JavaScript MOOC"
                  src="https://www.youtube.com/embed/6Ka2NoPcWck" 
                  frameborder='0'
                  allowfullscreen ></iframe>
          {:else}
          <img src='/moocjs.png' 
               alt='Video of the MOOC Diffuse JavaScript' />
          {/if}
          </span>
      </li>
      
      <li lang='fr'>
        <span class='va'>
          <a href="https://cnamcc.codegradx.org/"
             on:click={go}
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            C
          </a> exercices du <a href="https://www.fun-mooc.fr/courses/course-v1:itii+119003+session03/about" class='w3-btn w3-round-large w3-theme-l4'>
            MOOC Socle informatique du CNAM </a>
        </span></li>
      
      <li lang='fr'>
        <span class='va'>
          <a href="https://python.codegradx.org/"
             on:click={go}
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            Python
          </a> exercices du cours IN101 : Algorithmique et programmation
          de l'ENSTA ParisTech</span></li>
      
      <li lang='fr'>
        <span class='va'>
          <a href="https://jfp.codegradx.org/"
             on:click={go}
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            Journées Franciliennes de Programmation
          </a> (langage libre)</span></li>
    </ul>
  </div>
</div>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Problem from '../components/Problem.svelte';
 import Bottom from '../components/Bottom.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { fade } from 'svelte/transition';
 import { person } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson } from '../client/lib.mjs';

 let error = undefined;
 let showmoocjs = false;
 let showmoocprogrec = false;
 let underline = false;
 
 onMount(initializePerson);
 
 function go (event) {
   hideProblem();
   if ( ! $person ) {
     event.preventDefault();
     event.stopPropagation();
     error = "Vous devez d'abord vous identifier!";
     underline = true;
   }
 }

 function hideProblem (event) {
   error = undefined;
   underline = false;
 }

 function connect (event) {
   sapper.goto('/connect');
 }
 
</script>
