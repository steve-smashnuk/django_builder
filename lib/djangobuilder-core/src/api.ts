
import { type } from "os";
import {
  IDjangoApp,
  IDjangoProject,
  DjangoVersion,
  IDjangoModel,
  IDjangoField,
  IDjangoRelationship,
  IBuiltInModel,
  IFieldType,
  IFieldTestDefault,
  IRelationshipType,
} from "./types";


type ModelType = {
  type: string;
  class: string;
}

type BuiltInModelType = {
  app: string;
  fields: Record<string, Record<string, string>>;
}


export class Django2 {
  slugType: string;
  autoTypes: Array<string>;
  metaParams: Array<string>;
  fieldTypes: Record<string, Record<string, string>>;
  relationshipTypes: Record<string, Record<string, string>>;
  relationshipMatches: Array<string>;
  parentModelTypes: Record<string, ModelType>;
  builtInModels: Record<string, BuiltInModelType>;

  constructor() {
    this.slugType = 'django.db.models.SlugField'
    this.autoTypes = [
        'django.db.models.AutoField',
        'django.db.models.BigAutoField'
    ]
    this.metaParams = ['abstract']
    this.relationshipTypes = {
      'django.db.models.ForeignKey': {
        default_args: 'on_delete=models.CASCADE'
      },
      'django.db.models.OneToOneField': {
        default_args: 'on_delete=models.CASCADE'
      },
      'django.db.models.ManyToManyField': {}
    }
    this.relationshipMatches = [
      'ForeignKey',
      'models.ForeignKey',
      'db.models.ForeignKey',
      'OneToOneField',
      'models.OneToOneField',
      'db.models.OneToOneField',
      'ManyToManyField',
      'models.ManyToManyField',
      'db.models.ManyToManyField',
    ]
    this.parentModelTypes = {
      'django.contrib.auth.models.AbstractUser': {
        type: 'django',
        class: 'django.contrib.auth.models.AbstractUser',
      },
      'django.contrib.auth.models.AbstractBaseUser': {
        type: 'django',
        class: 'django.contrib.auth.models.AbstractBaseUser',
      },
    }
    this.builtInModels = {
      'django.contrib.auth.models.User': {
        app: 'auth.User',
        fields: {
          'username': {default:'username'},
          'email': {default:'username@tempurl.com'}
        }
      },
      'django.contrib.auth.models.AbstractUser': {
        app: 'auth.AbstractUser',
        fields: {
          'username': {default:'username'},
          'email': {default:'username@tempurl.com'}
        }
      },
      'django.contrib.auth.models.AbstractBaseUser': {
        app: 'auth.AbstractBaseUser',
        fields: {
          'username': {default:'username'},
          'email': {default:'username@tempurl.com'}
        }
      },
      'django.contrib.auth.models.Group': {
        app: 'auth.Group',
        fields: {
          'name': {default:'group'}
        }
      },
      'django.contrib.contenttypes.models.ContentType': {
        app: 'contenttypes.ContentType',
        fields: {}
      }
    }
    this.fieldTypes = {
      'django.db.models.EmailField': {},
      'django.db.models.TextField': {default_args: 'max_length=100'},
      'django.db.models.CharField': {default_args: 'max_length=30'},
      'django.db.models.SlugField': {},
      'django.db.models.URLField': {},
      'django.db.models.UUIDField': {},
      'django.db.models.DateField': {},
      'django.db.models.DateTimeField': {},
      'django.db.models.AutoField': {default_args: 'primary_key=True'},
      'django.db.models.CommaSeparatedIntegerField': {},
      'django.db.models.BigAutoField': {default_args: 'primary_key=True'},
      'django.db.models.BigIntegerField': {},
      'django.db.models.BooleanField': {},
      'django.db.models.DecimalField': {default_args: 'max_digits=10, decimal_places=2'},
      'django.db.models.DurationField': {},
      'django.db.models.FileField': {default_args: 'upload_to="upload/files/"'},
      'django.db.models.ImageField': {default_args: 'upload_to="upload/images/"'},
      'django.db.models.FilePathField': {},
      'django.db.models.FloatField': {},
      'django.db.models.IntegerField': {},
      'django.db.models.PositiveIntegerField': {},
      'django.db.models.PositiveSmallIntegerField': {},
      'django.db.models.IPAddressField': {},
      'django.db.models.GenericIPAddressField': {},
      'django.db.models.NullBooleanField': {},
      'django.db.models.TimeField': {},
      'django.db.models.BinaryField': {},
      'django.db.models.SmallIntegerField': {},
      'django.db.models.JSONField': {default_args: 'default=dict'},
      'django.contrib.contenttypes.fields.GenericForeignKey': {default_args: '"content_type", "object_id"'},
      'django.contrib.postgres.fields.ArrayField': {default_args: 'models.CharField(max_length=100)'},
      'django.contrib.postgres.fields.CICharField': {default_args: 'max_length=30'},
      'django.contrib.postgres.fields.CIEmailField': {},
      'django.contrib.postgres.fields.CITextField': {},
      'django.contrib.postgres.fields.HStoreField': {},
      'django.contrib.postgres.fields.ranges.IntegerRangeField': {},
      'django.contrib.postgres.fields.ranges.BigIntegerRangeField': {},
      'django.contrib.postgres.fields.ranges.FloatRangeField': {},
      'django.contrib.postgres.fields.ranges.DateTimeRangeField': {},
      'django.contrib.postgres.fields.ranges.DateRangeField': {},
      'django.contrib.gis.db.GeometryField': {},
      'django.contrib.gis.db.PointField': {},
      'django.contrib.gis.db.LineStringField': {},
      'django.contrib.gis.db.PolygonField': {},
      'django.contrib.gis.db.MultiPointField': {},
      'django.contrib.gis.db.MultiLineStringField': {},
      'django.contrib.gis.db.MultiPolygonField': {},
      'django.contrib.gis.db.GeometryCollectionField': {},
      'django.contrib.gis.db.RasterField': {},
    }
  }

}

const DEFAULT_MIDDLEWARES = [
  'django.middleware.security.SecurityMiddleware',
  'django.contrib.sessions.middleware.SessionMiddleware',
  'django.middleware.common.CommonMiddleware',
  'django.middleware.csrf.CsrfViewMiddleware',
  'django.contrib.auth.middleware.AuthenticationMiddleware',
  'django.contrib.messages.middleware.MessageMiddleware',
  'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

const HTMX_MIDDLEWARE = 'django_htmx.middleware.HtmxMiddleware'

export class BuiltInModel implements IBuiltInModel {
  name: string;
  model: string;

  constructor(
    name: string,
    model: string,
  ) {
    this.name = name;
    this.model = model;
  }
}

export const AuthUser = new BuiltInModel("auth.User", "User")
export const AbstractUser = new BuiltInModel("auth.AbstractUser", "AbstractUser")

export class DjangoRelationship implements IDjangoRelationship {
  model: IDjangoModel;
  name: string;
  type: IRelationshipType;
  to: IDjangoModel | IBuiltInModel;
  args: string;

  constructor(
    model: IDjangoModel,
    name: string,
    type: IRelationshipType,
    to: IDjangoModel | IBuiltInModel,
    args: string,
  ) {
    this.model = model;
    this.name = name;
    this.type = type;
    this.to = to;
    this.args = args;
  }

  relatedTo() {
    return this.to instanceof DjangoModel ? this.to.app.name + "." + this.to.name : this.to.name;
  }
}

export class FieldType implements IFieldType {
  name: string;
  testDefault: IFieldTestDefault;
  is_postgres = false;
  is_postgres_range = false;
  viewDefault: string | undefined;

  constructor(name: string, testDefault: IFieldTestDefault, is_postgres?: boolean, is_postgres_range?: boolean, viewDefault?: string ) {
    this.name = name;
    this.testDefault = testDefault;
    this.is_postgres = is_postgres === undefined ? false : true;
    this.is_postgres_range = is_postgres_range === undefined ? false : true;
    this.viewDefault = viewDefault;
  }
}

export const CharField = new FieldType("CharField", "'text'")
export const TextField = new FieldType("TextField", "'some\\ntext'");
export const JSONField = new FieldType("JSONField", '\'{"value": "key"}\'');
export const DateField = new FieldType("DateField", "'2022-01-01'");
export const DateTimeField = new FieldType("DateField", "'2022-01-01:09:00:00'");
export const BigIntegerField = new FieldType("BigIntegerField", '1000');
export const BooleanField = new FieldType("BooleanField", "True");
export const DecimalField = new FieldType("DecimalField", "1.0");
export const DurationField = new FieldType("DurationField", "timedelta(days=1)");
export const FileField = new FieldType("FileField", "'aFile'");
export const FloatField = new FieldType("FloatField", "1.1");
export const IntegerField = new FieldType("IntegerField", "1");
export const PositiveIntegerField = new FieldType("PositiveIntegerField", "1");
export const PositiveSmallIntegerField = new FieldType("PositiveSmallIntegerField", "1");
export const SlugField = new FieldType("SlugField", "'slug'");
export const GenericIPAddressField = new FieldType("GenericIPAddressField", "'127.0.0.1'");
export const TimeField = new FieldType("TimeField", "time()");
export const SmallIntegerField = new FieldType("SmallIntegerField", "1");
export const URLField = new FieldType("URLField", "'http://127.0.0.1'");
export const UUIDField = new FieldType("UUIDField", "uuid.uuid4()");
export const EmailField = new FieldType("EmailField", "'user@tempurl.com'");
export const ImageField = new FieldType("ImageField", "'anImage'");
export const ArrayField = new FieldType("ArrayField", "[1, 2, 3]", true);
export const CICharField = new FieldType("CICharField", "'text'");
export const CIEmailField = new FieldType("CIEmailField", "'user@tempurl.com'");
export const CITextField = new FieldType("CITextField", "'some\\ntext'");
export const HStoreField = new FieldType("HStoreField", "{}");
export const IntegerRangeField = new FieldType("IntegerRangeField", [0, 10], true, true, "NumericRange(0, 10)");
export const BigIntegerRangeField = new FieldType("BigIntegerRangeField", [0, 1000], true, true, "NumericRange(0, 1000)");
export const DateTimeRangeField = new FieldType("DateTimeRangeField", ["'2022-01-01:09:00:00'", "'2022-02-02:09:00:00'"], true, true, "DateTimeTZRange()");
export const DateRangeField = new FieldType("DateRangeField", ["'2022-01-01'", "'2022-02-02'"], true, true, "DateRange()");

export class RelationshipType implements IRelationshipType {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
}

export const ForeignKey = new RelationshipType("ForeignKey");
export const OneToOneRelationship = new RelationshipType("OneToOneField");
export const ManyToManyRelationship = new RelationshipType("ManyToManyField");

export class DjangoField implements IDjangoField {
  model: IDjangoModel;
  name: string;
  type: FieldType;
  args: string;
  is_editable_field: boolean

  constructor(
    model: IDjangoModel,
    name: string,
    type: FieldType,
    args: string,
    is_editable_field?: boolean
  ) {
    this.model = model;
    this.name = name;
    this.type = type;
    this.args = args;
    this.is_editable_field = is_editable_field === undefined || is_editable_field === true ? true : is_editable_field
  }

  get is_postgres_field() {
    return this.type.is_postgres;
  }

  importModule() {
    if (this.type.is_postgres) {
      if (this.type.is_postgres_range) {
        return "postgres_range_fields"
      }
      return "postgres_fields"
    }
    return "models"
  }
}

export class DjangoModel implements IDjangoModel {
  app: IDjangoApp;
  name: string;
  fields: IDjangoField[] = [];
  relationships: IDjangoRelationship[] = [];
  
  parents: IDjangoModel[] = [];
  abstract = false;
  
  primaryKey = "pk";
  nameField = "pk";
  relatedName: string

  constructor(
    app: IDjangoApp,
    name: string,
    abstract?: boolean,
    fields?: IDjangoField[],
    relationships?: IDjangoRelationship[],
    parents?: IDjangoModel[],
  ) {
    this.app = app;
    this.name = name;
    this.relatedName = name;
    if (abstract !== undefined) {
      this.abstract = abstract;
    }
    if (fields) {
      this.fields = fields;
    }
    if (relationships) {
      this.relationships = relationships;
    }
    if (parents) {
      this.parents = parents;
    }
  }

  setNameField(fieldName: string) {
    const nameField = this.fields.find(f => f.name == fieldName);
    if (nameField === undefined){
      throw new Error(`${fieldName} is not a field on the Model ${this.name}`)
    }
    this.nameField = fieldName;
  }

  addField(name: string, type: FieldType, args: string, editable?: boolean): DjangoField {
    const field = new DjangoField(this, name, type, args, editable);
    this.fields.push(field);
    return field;
  }

  addRelationship(name: string, type: RelationshipType, to: IDjangoModel | IBuiltInModel, args: string): DjangoRelationship {
    const relationship = new DjangoRelationship(this, name, type, to, args);
    this.relationships.push(relationship)
    return relationship;
  }

}

export class DjangoApp implements IDjangoApp {
  project: IDjangoProject;
  name: string;
  models: IDjangoModel[] = [];

  constructor(
    project: IDjangoProject,
    name: string,
    models?: IDjangoModel[]
  ) {
    this.project = project;
    this.name = name;
    if (models) {
      this.models = models
    }
  }

  addModel(name: string, abstract: boolean | undefined = false): DjangoModel {
    const model = new DjangoModel(this, name, abstract);
    this.models.push(model);
    return model;
  }

  get concreteModels(): IDjangoModel[] {
    return this.models.filter(model => !model.abstract)
  }
}

interface DjangoProjectParams {
  channels?: boolean,
  htmx?: boolean,
  postgres? : boolean,
}

class DjangoProject implements IDjangoProject {
  name: string;
  version: DjangoVersion;
  description: string;
  channels: boolean;
  htmx: boolean;
  postgres: boolean;
  apps: Array<IDjangoApp> = [];
  middlewares: Array<string> = [];

  // TODO
  pillow = true
  
  constructor(
    name: string,
    description = "",
    version: DjangoVersion = DjangoVersion.DJANGO4,
    options: DjangoProjectParams = {htmx: true, channels: true}
  ) {
    this.name = name;
    this.description = description;
    this.version = version;
    this.channels = options.channels == true || options.channels == undefined;
    this.htmx = options.htmx == true || options.htmx == undefined;
    this.postgres = options.postgres == true || options.postgres == undefined;
    this.apps = [];
    this.middlewares = DEFAULT_MIDDLEWARES
    if (this.htmx) {
      this.middlewares.push(HTMX_MIDDLEWARE)
    }
  }

  addApp(name: string): DjangoApp {
    const app = new DjangoApp(this, name);
    this.apps.push(app);
    return app;
  }
}

export default DjangoProject