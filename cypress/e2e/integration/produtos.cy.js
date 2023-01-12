/// <reference types="cypress"/>
import contrato from '../../contracts/products.contracts'

describe('Teste da funcionalidade Produtos', () => {
    let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })
    });

    it.only('Deve validar contrato de produto', () => {
cy.request('produtos').then(response =>{
    return contrato.validateAsync(response.body)
})
    });

    it('Listar produtos', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:3000/produtos'
        }).then((response) => {
            //expect(response.body.produtos[3].nome).to.equal('iphone 11')
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            expect(response.duration).to.be.lessThan(20)
        })

    });

    it('Cadastrar produto', () => {
        let produto = `Produto Ebac ${Math.floor(Math.random() * 100000)}`
        cy.request({
            method: 'POST',
            url: 'produtos',
            body: {
                "nome": produto,
                "preco": 470,
                "descricao": "Mouse",
                "quantidade": 381
            },
            headers: { authorization: token }

        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
        })

    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido ', () => {

        cy.cadastrarProduto(token, 'Produto EBAC novo 1', 250, 'Descricao do produto', 180)

            .then((response) => {
                expect(response.status).to.equal(400)
                expect(response.body.message).to.equal('Já existe produto com esse nome')
            })


    })
    it('Deve editar um produto já cadastrado', () => {
        let produto = `Produto Ebac ${Math.floor(Math.random() * 1000000000)}`
        cy.request('produtos').then((response => {
            let id = response.body.produtos._id
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: { authorization: token },
                body: {
                    "nome": produto,
                    "preco": 200,
                    "descricao": "Produto editado",
                    "quantidade": 2390
                }
            })
        }))
    });
    it('Deve editar um produto cadastrado previamente', () => {
        let produto = `Produto Ebac ${Math.floor(Math.random() * 1000000000)}`
        cy.cadastrarProduto(token, produto, 250, 'Descricao do produto novo', 180)
            .then(response => {
                let id = response.body._id

                cy.request('produtos').then((response => {
                    cy.request({
                        method: 'PUT',
                        url: `produtos/${id}`,
                        headers: { authorization: token },
                        body: {
                            "nome": produto,
                            "preco": 300,
                            "descricao": "Produto editado",
                            "quantidade": 200
                        }
                    }).then(response => {
                        expect(response.body.message).to.equal('Registro alterado com sucesso')
                    })
                })


                );

            })
    })
    it('Deve deletar um produto previamente cadastrado', () => {
        let produto = `Produto Ebac ${Math.floor(Math.random() * 1000000000)}`
        cy.cadastrarProduto(token, produto, 250, 'Descricao do produto novo', 180)
            .then(response => {
                let id = response.body._id
                cy.request({
                    method: 'Delete',
                    url: `produtos/${id}`,
                    headers: { authorization: token }
                }).then(response => {
                    expect(response.body.message).to.equal('Registro excluído com sucesso')
                    expect(response.status).to.equal(200)
                })
            });
    })
})
