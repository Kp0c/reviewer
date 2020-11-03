import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(private firestore: AngularFirestore,
              private afAuth: AngularFireAuth) { }

  addNewProject(project: Project): Promise<DocumentReference> {
    return this.afAuth.user.pipe(
      switchMap(user => {
        return from(this.firestore.collection('projects').add({
          ...project,
          owner: user.uid
        }));
      })
    ).toPromise();
  }

  getProjects(): Observable<Project[]> {
    return this.afAuth.user.pipe(
      filter(user => !!user),
      switchMap(user => {
        return this.firestore.collection<Project>(`projects`, ref => ref.where('owner', '==', user.uid)).snapshotChanges().pipe(
          switchMap(actions => {
            return of(actions.map(action => {
              const doc = action.payload.doc;
              const data = doc.data();

              return {
                ...data,
                id: doc.id
              } as Project;
            }));
          })
        );
      })
    );
  }
}