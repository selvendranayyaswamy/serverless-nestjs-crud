import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { AppConfig } from '../configs/config';

@Injectable()
export class EmployeeService {
  protected readonly documentClient: any;
  private readonly tableName: string;
  private readonly region: string;
  private readonly environment: string;

  // Get the DynamoDB Client as per the configuration.
  private getDynamoDbClient(): any {
    console.log(this.region)
    // This is to support local testing with dynalite.
    if (this.environment === 'local') {
      return new AWS.DynamoDB.DocumentClient({
        region: 'us-east-1',
        endpoint: 'http://localhost:8000'
      });
    } else {
      return new AWS.DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: this.region
      });
    }
  }

  constructor() {
    this.tableName = AppConfig.DYNAMODB_TABLE_NAME;
    this.region = AppConfig.REGION;
    this.environment = AppConfig.ENVIRONMENT;
    this.documentClient = this.getDynamoDbClient();

  }

  public async createEmployee(employee) {
    const params = {
      TableName: this.tableName,
      Item: { pk: 'EMPLOYEE', sk: employee.id, value: employee }
    };
    return new Promise((resolve, reject) => {
      return this.documentClient.put(params, (error, data) => {
        if (error) {
          console.log(error);
          reject({ message: error.message });
        } else {
          resolve({ message: 'Employee Created ' });
        }
      });
    });
  }

  public async getEmployeeById(id) {
    const readParams = {
      TableName: this.tableName,
      Key: {
        pk: 'EMPLOYEE',
        sk: id
      }
    };
    return new Promise((resolve, reject) => {
      return this.documentClient.get(readParams, (error, data) => {
        if (error) {
          console.log(error);
          reject(error.message);
        } else if (!data.Item) {
          resolve({ status: 404, data: "Employee Not Found" });
        } else {
          resolve({ status: 200, data: data.Item.value });
        }
      });
    });

  }

  public getEmployees() {
    const readParams = {
      TableName: this.tableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": 'EMPLOYEE'
      }
    };
    return new Promise((resolve, reject) => {
      return this.documentClient.query(readParams, (error, data) => {
        if (error) {
          console.log(error);
          reject(error.message);
        } else if (data.Items.length < 1) {
          resolve({ status: 404, data: "Employee Not Found" });
        } else {
          resolve({ status: 200, data: data.Items.map(e => e.value) });
        }
      });
    });

  }

  public async updateEmployee(id, employee) {
    const updateParams = {
      TableName: this.tableName,
      Key: {
        pk: 'EMPLOYEE',
        sk: id
      },
      UpdateExpression: 'SET #value = :employee',
      ConditionExpression: 'pk = :pk and sk = :sk',
      ExpressionAttributeNames: {
        '#value': 'value'
      },
      ExpressionAttributeValues: {
        ':pk': 'EMPLOYEE',
        ':sk': id,
        ':employee': employee
      },
      ReturnValues: 'ALL_OLD'
    };
    return new Promise((resolve, reject) => {
      return this.documentClient.update(updateParams, (error, data) => {
        if (error) { // Reject
          console.log(error);
          resolve({ status: 404, data: `Employee ${id} cannot be updated` });
        } else { // Resolve
          resolve({ status: 200, data: `Employee ${id} updated successfully` });
        }
      });
    });


  }

  public async deleteEmployee(id) {
    const keyParams = {
      TableName: this.tableName,
      Key: {
        pk: 'EMPLOYEE',
        sk: id,
      },
      ReturnValues: 'ALL_OLD',
    };
    return new Promise((resolve, reject) => {
      return this.documentClient.delete(keyParams, (error, data) => {
        if (error) {
          console.log(error);
          reject(error.message);
        } else if (!data.Attributes) {
          resolve({ status: 404, data: `Employee ${id} Not Found` });
        } else {
          resolve({ status: 200, data: `Employee ${id} Deleted Successfully` });
        }
      });
    });
  }
}
