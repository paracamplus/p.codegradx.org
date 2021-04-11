<!--
      Page intended for teachers.
-->

<style>
</style>

<Page title="Enseignant {personTitle} {campaignTitle}"
      shortTitle="Enseignant" >

  {#if $campaign}
  <p class='smallHint'>L'univers {$campaign.name} est
    {#if $campaign.active}
    en cours [{CodeGradX.Date2str($campaign.starttime).replace(/ .*$/, '')} -
      {CodeGradX.Date2str($campaign.endtime).replace(/ .*$/, '')}]
    {:else}inactif{/if}
  </p>
  {/if}

  <Problem bind:error={error} />
  
  {#if $campaign && $person && isTeacher($campaign, $person) }
  <h2>Listes</h2>
  <div class='w3-center'>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={showStudentsCreation}>nouveaux apprenants</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:teachers={showTeachers}
            on:click={showStudents}>apprenants</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:students={showStudents}
            on:click={showTeachers}>enseignants</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={showExercises}>exercices</button>
  </div>

  {#if showStudentsCreationForm}
    <StudentsCreation on:students={showStudents}/>
  {:else if showStudentsList}
    <StudentsList bind:showPersonsList={showStudentsList} />
  {:else if showTeachersList}
    <TeachersList bind:showPersonsList={showTeachersList} />
  {:else if showExercisesList}
    <AllExercicesList bind:showExercisesList={showExercisesList} />
  {/if}

  <h2>Statistiques</h2>
  <div class='w3-center'>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={showPerStudent}>par apprenants</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={showPerExercise}>par exercice</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={showPerDay}>par jour</button>
  </div>

  {#if showStudentsStats}
  <StudentsStats bind:showStudentsStats={showStudentsStats} />
  {:else if showExercisesStats}
  <ExercisesStats bind:showExercisesStats={showExercisesStats} />
  {:else if showDaysStats}
  <DaysStats bind:showDaysStats={showDaysStats} />
  {/if}

  <h2>Notifications</h2>
  <div class='w3-center'>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={showNotifications}>dernières notifications</button>
  </div>

  {:else if ! error}
  <div>
    <p class='waitingMessage'>Chargement des données de l'univers...</p>
    <WaitingImage />
  </div>
  {/if}
  
</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 import FileChooser from '../../components/FileChooser.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import StudentsList from '../../components/StudentsList.svelte';
 import StudentsCreation from '../../components/StudentsCreation.svelte';
 import TeachersList from '../../components/TeachersList.svelte';
 import AllExercicesList from '../../components/AllExercisesList.svelte';
 import StudentsStats from '../../components/StudentsStats.svelte';
 import ExercisesStats from '../../components/ExercisesStats.svelte';
 import DaysStats from '../../components/DaysStats.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, campaign, lastmessage } from '../../stores.mjs';
 import { initializePerson, isTeacher, goto } from '../../client/lib.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx/src/newexercise';
 import { CodeGradX as _ } from 'codegradx/src/userlib';
 import { fetchCampaign } from '../../client/campaignlib.mjs';
 import { sleep } from '../../common/utils.mjs';

 let error = undefined;
 let personTitle = "";
 let campaignTitle = ''; 
 let showStudentsList = false;
 let showStudentsCreationForm = false;
 let showTeachersList = false;
 let showExercisesList = false;
 let showStudentsStats = false;
 let showExercisesStats = false;
 let showDaysStats = false;

 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     error = "Désolé, j'ignore qui vous êtes!";
     return;
   }
   //console.log($person);
   personTitle = $person.pseudo;
   const uri = window.document.location.pathname;
   const campaignName = uri.replace(/^(.*\/)?teacher\/([^\/]+)/, '$2');
   $campaign = await fetchCampaign($person, campaignName);
   if ( ! $campaign ) {
     $lastmessage = error = "Je ne vois pas d'univers ainsi nommé!";
     goto('/universes');
     return;
   }
   //console.log($campaign);
   campaignTitle = `de ${$campaign.name}`;
   if ( ! isTeacher($campaign, $person) ) {
     error = "Vous n'êtes pas un enseignant de cet univers!";
     return;
   }
 });

 function showStudents (event) {
   showStudentsCreationForm = showTeachersList = showExercisesList = false;
   showStudentsStats = showExercisesStats = showDaysStats = false;
   showStudentsList = ! showStudentsList;
 }
 function showStudentsCreation (event) {
   showStudentsList = showTeachersList = showExercisesList = false;
   showStudentsStats = showExercisesStats = showDaysStats = false;
   showStudentsCreationForm = ! showStudentsCreationForm;
 }
 function showTeachers (event) {
   showStudentsCreationForm = showStudentsList = showExercisesList = false;
   showStudentsStats = showExercisesStats = showDaysStats = false;
   showTeachersList = ! showTeachersList;
 }
 function showExercises (event) {
   showStudentsCreationForm = showTeachersList = showStudentsList = false;
   showStudentsStats = showExercisesStats = showDaysStats = false;
   showExercisesList = ! showExercisesList;
 }
 
 function showPerStudent (event) {
   showStudentsList = showTeachersList = showStudentsList = false;
   showExercisesStats = showDaysStats = false;
   showStudentsStats = ! showStudentsStats;
 }
 function showPerExercise (event) {
   showStudentsList = showTeachersList = showStudentsList = false;
   showStudentsStats = showDaysStats = false;
   showExercisesStats = ! showExercisesStats;
 }
 function showPerDay (event) {
   showStudentsList = showTeachersList = showStudentsList = false;
   showStudentsStats = showExercisesStats = false;
   showDaysStats = ! showDaysStats;
 }

 async function showNotifications (event) {
 }

</script>
