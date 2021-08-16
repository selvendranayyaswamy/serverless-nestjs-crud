import { Body, Controller, Delete, Get, Param, Post, Put, Res } from "@nestjs/common";
import { EmployeeService } from '../services/employee.service';
import { Response } from 'express';

@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  async createEmployee(@Body() employee ){
    const result = await this.employeeService.createEmployee(employee);
    return result;
  }

  @Get(':employeeId')
  async getEmployeeById(@Param('employeeId') employeeId, @Res() res: Response) {
    const result: any = await this.employeeService.getEmployeeById(employeeId);
    res.status(result.status).json(result.data);
  }

  @Get()
  async getEmployees(@Res() res: Response) {
    const result: any = await this.employeeService.getEmployees();
    res.status(result.status).json(result.data);
  }

  @Put(':employeeId')
  async updateEmployee(@Param('employeeId') employeeId, @Body() employee, @Res() res: Response){
    const result: any = await this.employeeService.updateEmployee(
      employeeId,
      employee,
    );
    res.status(result.status).json(result.data);
  }
  @Delete(':employeeId')
  async deleteEmployee(@Param('employeeId') employeeId, @Res() res: Response){
    const result: any = await this.employeeService.deleteEmployee(employeeId);
    res.status(result.status).json(result.data);

  }
}
