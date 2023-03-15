import { defineStore } from "pinia";
import {
  fetchApps,
  fetchModels,
  fetchProjects,
  fetchFields,
  fetchRelationships,
  getDeleteBatch,
  deleteProject,
  deleteApp,
  deleteModel,
  addApp,
  addModel,
} from "../firebase";
import type { Unsubscribe, User } from "firebase/auth";
import type { App, Field, Model, Project, Relationship } from "@/types";
import type { DocumentChange, DocumentData } from "firebase/firestore";
import {
  BuiltInModelTypes,
  DjangoApp,
  DjangoProject,
  DjangoRelationship,
  DjangoVersion,
  FieldTypes,
  RelationshipTypes,
  DjangoField,
  DjangoModel,
} from "@djangobuilder/core";
import { AuthUser } from "@djangobuilder/core/src/api";
import type {
  IDjangoApp,
  IDjangoField,
  IDjangoModel,
  IDjangoRelationship,
} from "@djangobuilder/core/src/types";

export const useUserStore = defineStore({
  id: "user",
  state: () => ({
    loaded: false,
    subscriptions: [] as Array<Unsubscribe>,
    user: null as User | null,
    projects: {} as Record<string, Project>,
    apps: {} as Record<string, App>,
    models: {} as Record<string, Model>,
    fields: {} as Record<string, Field>,
    relationships: {} as Record<string, Relationship>,
    coreProjects: {} as Record<string, DjangoProject>,
    coreApps: {} as Record<string, DjangoApp>,
    projectids: {} as Map<DjangoProject, string>,
    appids: {} as Map<DjangoApp, string>,
    modelids: {} as Map<DjangoModel, string>,
    fieldids: {} as Map<DjangoField, string>,
    relationshipids: {} as Map<DjangoRelationship, string>,
  }),
  getters: {
    getLoaded: (state) => state.loaded,
    getUser: (state) => state.user,
    getProjects: (state) => state.projects,
    getProject: (state) => (projectid: string) => state.projects[projectid],
    getApps: (state) => state.apps,
    getModels: (state) => state.models,
    getFields: (state) => state.fields,
    getRelationships: (state) => state.relationships,
    getCoreProjects: (state) => state.coreProjects,
    getCoreProject: (state) => (projectid: string) =>
      state.coreProjects[projectid],
    getCoreApp: (state) => (appid: string) =>
      state.coreApps[appid],
    getProjectId: (state) => (project: DjangoProject) =>
      state.projectids.get(project),
    getAppId: (state) => (app: DjangoApp) => state.appids.get(app),
    getModelId: (state) => (app: DjangoModel) => state.modelids.get(app),
    getFieldId: (state) => (field: DjangoField) => state.fieldids.get(field),
    getRelationshipId: (state) => (relationship: DjangoRelationship) =>
      state.relationshipids.get(relationship),
  },
  actions: {
    getAllModelSubIds(model: DjangoModel) {
      const field_ids: Array<string> = [];
      const relationship_ids: Array<string> = [];

      model.fields.forEach((field: IDjangoField) => {
        const fieldid = this.fieldids.get(field as DjangoField);
        if (fieldid) field_ids.push(fieldid);
      });
      model.relationships.forEach((relationship: IDjangoRelationship) => {
        const relationshipid = this.relationshipids.get(
          relationship as DjangoRelationship
        );
        if (relationshipid) relationship_ids.push(relationshipid);
      });

      return {
        field_ids,
        relationship_ids,
      };
    },
    getAllAppSubIds(app: DjangoApp) {
      const app_model_ids: Array<string> = [];
      const app_field_ids: Array<string> = [];
      const app_relationship_ids: Array<string> = [];

      app.models.forEach((model: IDjangoModel) => {
        const modelid = this.modelids.get(model as DjangoModel);
        if (modelid) app_model_ids.push(modelid);
        const { field_ids, relationship_ids } = this.getAllModelSubIds(
          model as DjangoModel
        );
        app_field_ids.push(...field_ids);
        app_relationship_ids.push(...relationship_ids);
      });

      return {
        modelids: app_model_ids,
        fieldids: app_field_ids,
        relationshipids: app_relationship_ids,
      };
    },
    getAllProjectSubIds(project: DjangoProject) {
      const project_app_ids: Array<string> = [];
      const project_model_ids: Array<string> = [];
      const project_field_ids: Array<string> = [];
      const project_relationship_ids: Array<string> = [];

      project.apps.forEach((app: IDjangoApp) => {
        const { modelids, fieldids, relationshipids } =
          this.getAllAppSubIds(app);
        project_model_ids.push(...modelids);
        project_field_ids.push(...fieldids);
        project_relationship_ids.push(...relationshipids);
        const appid = this.appids.get(app as DjangoApp);
        if (appid) {
          project_app_ids.push(appid);
        }
      });
      return {
        appids: project_app_ids,
        modelids: project_model_ids,
        fieldids: project_field_ids,
        relationshipids: project_relationship_ids,
      };
    },
    onUpdate(changedEntity: string, change: DocumentChange<DocumentData>) {
      const data = change.doc.data();
      const id = change.doc.id;
      if (change.type === "modified" || change.type === "added") {
        if (change.type === "modified") {
          console.log("Modified: ", changedEntity, data);
        } else if (change.type === "added") {
          //console.log("Added: ", changedEntity, data);
        } else {
          console.error("Don't understand how to handle change", change.type);
        }
        if (changedEntity === "project") {
          this.projects[id] = Object.assign(data, { id }) as Project;
        } else if (changedEntity === "app") {
          this.apps[id] = Object.assign(data, { id }) as App;
        } else if (changedEntity === "model") {
          this.models[id] = Object.assign(data, { id }) as Model;
        } else if (changedEntity === "field") {
          this.fields[id] = Object.assign(data, { id }) as Field;
        } else if (changedEntity === "relationship") {
          this.relationships[id] = Object.assign(data, { id }) as Relationship;
        } else {
          console.error("Don't understand how to update/add", changedEntity);
        }
      } else if (change.type === "removed") {
        console.log("Removed: ", changedEntity, data);
        if (changedEntity === "project") {
          delete this.projects[id];
          delete this.coreProjects[id];
        } else if (changedEntity === "app") {
          delete this.apps[id];
        } else if (changedEntity === "model") {
          delete this.models[id];
        } else if (changedEntity === "field") {
          delete this.fields[id];
        } else if (changedEntity === "relationship") {
          delete this.relationships[id];
        } else {
          console.error("Don't understand how to remove", changedEntity);
        }
      } else {
        console.error("Don't understand how to handle the change", change);
      }
      if (this.loaded) {
        this.createCoreProjects();
      }
    },
    setUser(user: User | null) {
      this.user = user;
    },
    logoutUser() {
      this.subscriptions.forEach((unsub) => {
        unsub();
      });
      this.user = null;
      this.projects = {};
      this.apps = {};
      this.models = {};
      this.fields = {};
      this.relationships = {};
      this.coreProjects = {};
      this.projectids = new Map();
      this.appids = new Map();
      this.modelids = new Map();
      this.fieldids = new Map();
      this.relationshipids = new Map();
      this.loaded = false;
    },
    async loginUser(user: User | null) {
      this.user = user;
      if (user) {
        this.projects = {};
        this.apps = {};
        this.models = {};
        this.fields = {};
        this.relationships = {};
        this.coreProjects = {};
        this.projectids = new Map();
        this.appids = new Map();
        this.modelids = new Map();
        this.fieldids = new Map();
        this.relationshipids = new Map();
        await this.fetchUserData(user);
      }
    },
    createCoreProjects() {
      Object.entries(this.projects).forEach(([projectid, project]) => {
        const coreVersion = String(project.django_version).startsWith("2")
          ? DjangoVersion.DJANGO2
          : String(project.django_version).startsWith("3")
          ? DjangoVersion.DJANGO3
          : DjangoVersion.DJANGO4;

        const coreProject = new DjangoProject(
          project.name,
          project.description,
          coreVersion,
          { channels: project.channels, htmx: project.htmx }
        );
        this.projectids.set(coreProject, projectid);
        this.coreProjects[projectid] = coreProject;

        Object.keys(project.apps).forEach((appid) => {
          const app = this.apps[appid];
          if (!app) {
            console.error("Missing app", appid, "from project", project);
            return;
          }
          const coreApp = coreProject.addApp(app.name);
          this.appids.set(coreApp, appid);
          this.coreApps[appid] = coreApp;
          Object.keys(app.models).forEach((modelid) => {
            const model = this.models[modelid];
            if (!model) {
              console.error("Missing model", modelid, "from app", appid);
              return;
            }
            const coreModel = coreApp.addModel(model.name, model.abstract);
            this.modelids.set(coreModel as DjangoModel, modelid);
            Object.keys(model.fields).forEach((fieldid) => {
              const field = this.fields[fieldid];
              const typeSplit = field.type.split(".");
              const typeSplitLast = typeSplit[typeSplit.length - 1];
              const fieldType = FieldTypes[typeSplitLast];
              // TODO - editable?
              const coreField = coreModel.addField(
                field.name,
                fieldType,
                field.args,
                false
              );
              this.fieldids.set(coreField as DjangoField, fieldid);
            });

            Object.keys(model.relationships).forEach((relationshipid) => {
              const relationship = this.relationships[relationshipid];

              const typeSplit = relationship.type.split(".");
              const typeSplitLast = typeSplit[typeSplit.length - 1];
              const relationshipType = RelationshipTypes[typeSplitLast];

              // TODO - relationship.to might be to another model
              const toSplit = relationship.to.split(".");
              const toSplitLast = toSplit[toSplit.length - 1];
              const relationshipTo = Object.values(BuiltInModelTypes).find(
                (bim) => bim.model === toSplitLast
              );

              const coreRelationship = coreModel.addRelationship(
                relationship.name,
                relationshipType,
                relationshipTo || AuthUser,
                relationship.args
              );
              this.relationshipids.set(coreRelationship, relationshipid);
            });
          });
        });
      });
    },
    async addApp(project: DjangoProject, name: string) {
      const projectid = this.getProjectId(project);
      const user = this.getUser
      if (user && projectid) {
        addApp(user, projectid, name);
      }
    },
    async addModel(app: DjangoApp, name: string, abstract: boolean) {
      const appid = this.getAppId(app);
      const user = this.getUser
      if (user && appid) {
        addModel(user, appid, name, abstract);
      }
    },
    async deleteProject(project: DjangoProject) {
      const { appids, modelids, fieldids, relationshipids } = this.getAllProjectSubIds(project);
      const projectid = this.projectids.get(project)
      if (projectid) {
        const batch = await getDeleteBatch([], appids, modelids, fieldids, relationshipids);
        await deleteProject(projectid, batch);
      }
    },
    async deleteApp(app: DjangoApp) {
      const { modelids, fieldids, relationshipids } = this.getAllAppSubIds(app);
      const appid = this.appids.get(app)
      const projectid = this.projectids.get(app.project as DjangoProject)
      if (appid && projectid) {
        const batch = await getDeleteBatch([], [], modelids, fieldids, relationshipids);
        await deleteApp(projectid, appid, batch);
      } else {
        throw new Error("Could not delete app " + app.name);
      }
    },
    async deleteModel(model: DjangoModel) {
      const { field_ids, relationship_ids } = this.getAllModelSubIds(model);
      const modelid = this.modelids.get(model)
      const appid = this.appids.get(model.app)
      if (modelid && appid) {
        const batch = await getDeleteBatch([], [], [modelid], field_ids, relationship_ids);
        await deleteModel(appid, modelid, batch)
      } else {
        throw new Error("Could not delete model " + model.name);
      }
    },
    async fetchUserData(user: User) {
      this.loaded = false;
      const [
        projectsData,
        appsData,
        modelsData,
        fieldsData,
        relationshipsData,
      ] = await Promise.all([
        fetchProjects(user, (change) => this.onUpdate("project", change)),
        fetchApps(user, (change) => this.onUpdate("app", change)),
        fetchModels(user, (change) => this.onUpdate("model", change)),
        fetchFields(user, (change) => this.onUpdate("field", change)),
        fetchRelationships(user, (change) =>
          this.onUpdate("relationship", change)
        ),
      ]);
      const { result: projects, unsubscribe: onsubProjects } = projectsData;
      const { result: apps, unsubscribe: onsubApps } = appsData;
      const { result: models, unsubscribe: onsubModels } = modelsData;
      const { result: fields, unsubscribe: onsubFields } = fieldsData;
      const { result: relationships, unsubscribe: onsubRelationships } =
        relationshipsData;
      console.debug("projects", projects);
      console.debug("apps", apps);
      console.debug("models", models);
      console.debug("fields", fields);
      console.debug("relationships", relationships);
      this.projects = projects;
      this.apps = apps;
      this.models = models;
      this.fields = fields;
      this.relationships = relationships;
      this.createCoreProjects();
      this.subscriptions = [
        onsubProjects,
        onsubApps,
        onsubModels,
        onsubFields,
        onsubRelationships,
      ];
      this.loaded = true;
    },
  },
});